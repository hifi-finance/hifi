import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { BalanceSheetErrors, CollateralFlashUniswapV2Errors, FlashUtilsErrors } from "@hifi/errors";
import { USDC, WBTC, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";

import type { GodModeErc20 } from "../../../../src/types/GodModeErc20";
import { deployGodModeErc20 } from "../../../shared/deployers";

async function increasePoolReserves(this: Mocha.Context, wbtcAmount: BigNumber, usdcAmount: BigNumber): Promise<void> {
  // Mint WBTC to the pair contract.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.__godMode_mint(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pair contract.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.__godMode_mint(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

function encodeCallData(this: Mocha.Context): string {
  const types = ["address", "address", "uint256"];
  const turnout: string = String(WBTC("0.001"));
  const values = [this.signers.borrower.address, this.contracts.hToken.address, turnout];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

async function getSeizeAndRepayAndProfitCollateralAmounts(
  this: Mocha.Context,
  repayHTokenAmount: BigNumber,
  swapUnderlyingAmount: BigNumber,
): Promise<{
  expectedProfitCollateralAmount: BigNumber;
  repayCollateralAmount: BigNumber;
  seizeCollateralAmount: BigNumber;
}> {
  const seizeCollateralAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
    this.contracts.hToken.address,
    repayHTokenAmount,
    this.contracts.wbtc.address,
  );
  const repayCollateralAmount = await this.contracts.collateralFlashUniswapV2.getRepayCollateralAmount(
    this.contracts.uniswapV2Pair.address,
    this.contracts.usdc.address,
    swapUnderlyingAmount,
  );
  const expectedProfitCollateralAmount = seizeCollateralAmount.sub(repayCollateralAmount);
  return { expectedProfitCollateralAmount, repayCollateralAmount, seizeCollateralAmount };
}

async function getTokenAmounts(
  this: Mocha.Context,
  wbtcAmount: BigNumber,
  usdcAmount: BigNumber,
): Promise<{ token0Amount: BigNumber; token1Amount: BigNumber }> {
  const token0: string = await this.contracts.uniswapV2Pair.token0();
  if (token0 == this.contracts.wbtc.address) {
    return {
      token0Amount: wbtcAmount,
      token1Amount: usdcAmount,
    };
  } else {
    return {
      token0Amount: usdcAmount,
      token1Amount: wbtcAmount,
    };
  }
}

async function reducePoolReserves(this: Mocha.Context, wbtcAmount: BigNumber, usdcAmount: BigNumber): Promise<void> {
  // Mint WBTC to the pair contract.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.__godMode_burn(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pair contract.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.__godMode_burn(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

export function shouldBehaveLikeUniswapV2Call(): void {
  context("when the data is malformed", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const token0Amount: BigNumber = Zero;
      const token1Amount: BigNumber = Zero;
      const data: string = "0x";
      await expect(
        this.contracts.collateralFlashUniswapV2
          .connect(this.signers.raider)
          .uniswapV2Call(sender, token0Amount, token1Amount, data),
      ).to.be.reverted;
    });
  });

  context("when the data is encoded correctly", function () {
    let data: string;

    beforeEach(function () {
      data = encodeCallData.call(this);
    });

    context("when the caller is not the UniswapV2Pair contract", function () {
      const token0Amount: BigNumber = Zero;
      const token1Amount: BigNumber = Zero;
      let sender: string;

      beforeEach(async function () {
        sender = this.signers.raider.address;
      });

      context("when the caller is an externally owned account", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.collateralFlashUniswapV2
              .connect(this.signers.raider)
              .uniswapV2Call(sender, token0Amount, token1Amount, data),
          ).to.be.revertedWith("function call to a non-contract account");
        });
      });

      context("when the caller is a malicious pair", function () {
        it("reverts", async function () {
          const to: string = this.contracts.collateralFlashUniswapV2.address;
          await expect(
            this.contracts.maliciousPair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(CollateralFlashUniswapV2Errors.CallNotAuthorized);
        });
      });
    });

    context("when the caller is the UniswapV2Pair contract", function () {
      beforeEach(async function () {
        // Set the oracle price to 1 WBTC = $20k.
        await this.contracts.wbtcPriceFeed.setPrice(price("20000"));

        // Set the oracle price to 1 USDC = $1.
        await this.contracts.usdcPriceFeed.setPrice(price("1"));

        // Mint 100 WBTC and 2m USDC to the pair contract. This makes the price 1 WBTC ~ 20k USDC.
        await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));
      });

      context("when the underlying is not part of the UniswapV2Pair contract", function () {
        it("reverts", async function () {
          const { token0Amount, token1Amount } = await getTokenAmounts.call(this, Zero, USDC("10000"));
          const foo: GodModeErc20 = await deployGodModeErc20(this.signers.admin, "Foo", "FOO", BigNumber.from(18));
          await this.contracts.hToken.__godMode_setUnderlying(foo.address);
          const to: string = this.contracts.collateralFlashUniswapV2.address;
          await expect(
            this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(FlashUtilsErrors.UnderlyingNotInPool);
        });
      });

      context("when the underlying is part of the UniswapV2Pair contract", function () {
        context("when collateral is flash borrowed", function () {
          it("reverts", async function () {
            const { token0Amount, token1Amount } = await getTokenAmounts.call(this, WBTC("1"), Zero);
            const to: string = this.contracts.collateralFlashUniswapV2.address;
            await expect(
              this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
            ).to.be.revertedWith(FlashUtilsErrors.FlashBorrowOtherToken);
          });
        });

        context("when underlying is flash borrowed", function () {
          const borrowAmount: BigNumber = hUSDC("10000");
          const collateralCeiling: BigNumber = WBTC("100");
          const debtCeiling: BigNumber = hUSDC("1e6");
          const depositWbtcAmount: BigNumber = WBTC("1");
          const swapCollateralAmount: BigNumber = Zero;
          const swapUnderlyingAmount: BigNumber = USDC("10000");

          let token0Amount: BigNumber;
          let token1Amount: BigNumber;

          beforeEach(async function () {
            const tokenAmounts = await getTokenAmounts.call(this, swapCollateralAmount, swapUnderlyingAmount);
            token0Amount = tokenAmounts.token0Amount;
            token1Amount = tokenAmounts.token1Amount;

            // List the bond in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

            // List the collateral in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

            // Set the liquidation incentive to 10%.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(this.contracts.wbtc.address, LIQUIDATION_INCENTIVES.default);

            // Set the collateral ceiling.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralCeiling(this.contracts.wbtc.address, collateralCeiling);

            // Set the debt ceiling.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.contracts.hToken.address, debtCeiling);

            // Mint WBTC and approve the BalanceSheet to spend it.
            await this.contracts.wbtc.__godMode_mint(this.signers.borrower.address, depositWbtcAmount);
            await this.contracts.wbtc
              .connect(this.signers.borrower)
              .approve(this.contracts.balanceSheet.address, MaxUint256);

            // Deposit the WBTC in the BalanceSheet.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.contracts.wbtc.address, depositWbtcAmount);

            // Borrow hUSDC.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .borrow(this.contracts.hToken.address, borrowAmount);
          });

          context("when the borrower does not have a liquidity shortfall", function () {
            it("reverts", async function () {
              const to: string = this.contracts.collateralFlashUniswapV2.address;
              await expect(
                this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data),
              ).to.be.revertedWith(BalanceSheetErrors.NO_LIQUIDITY_SHORTFALL);
            });
          });

          context("when the borrower has a liquidity shortfall", function () {
            context(
              "when the price given by the UniswapV2Pair contract price is better than the oracle price",
              function () {
                beforeEach(async function () {
                  // Set the WBTC price to $12.5k to make borrower's collateral ratio 125%.
                  await this.contracts.wbtcPriceFeed.setPrice(price("12500"));

                  // Burn 1m USDC from the pair contract. This makes the pair contract price 1 WBTC ~ 10k USDC.
                  await reducePoolReserves.call(this, Zero, USDC("1e6"));
                });

                it("reverts", async function () {
                  const to: string = this.contracts.collateralFlashUniswapV2.address;
                  await expect(
                    this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(token0Amount, token1Amount, to, data),
                  ).to.be.revertedWith(CollateralFlashUniswapV2Errors.TurnoutNotSatisfied);
                });
              },
            );

            context("when the price given by the UniswapV2Pair contract is the same as the oracle price", function () {
              let expectedProfitCollateralAmount: BigNumber;
              let repayCollateralAmount: BigNumber;
              let seizeCollateralAmount: BigNumber;

              context("when the collateral ratio is lower than 110%", function () {
                const repayHTokenAmount: BigNumber = hUSDC("9090.909090909090909090");

                beforeEach(async function () {
                  // Set the WBTC price to $10k to make the borrower's collateral ratio 100%.
                  await this.contracts.wbtcPriceFeed.setPrice(price("10000"));

                  // Calculate the amounts necessary for running the tests.
                  const calculatedAmounts = await getSeizeAndRepayAndProfitCollateralAmounts.call(
                    this,
                    repayHTokenAmount,
                    swapUnderlyingAmount,
                  );
                  expectedProfitCollateralAmount = calculatedAmounts.expectedProfitCollateralAmount;
                  repayCollateralAmount = calculatedAmounts.repayCollateralAmount;
                  seizeCollateralAmount = calculatedAmounts.seizeCollateralAmount;
                });

                it("flash swaps USDC via and makes a WBTC profit", async function () {
                  const to: string = this.contracts.collateralFlashUniswapV2.address;
                  const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  await this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  expect(newCollateralBalance.sub(expectedProfitCollateralAmount)).to.equal(oldCollateralBalance);
                });
              });

              context("when the collateral ratio is lower than 150% but higher than 110%", function () {
                const repayHTokenAmount: BigNumber = hUSDC("10000");

                beforeEach(async function () {
                  // Set the WBTC price to $12.5k to make borrower's collateral ratio 125%.
                  await this.contracts.wbtcPriceFeed.setPrice(price("12500"));

                  // Burn 750k USDC from the pair contract, which makes the price 1 WBTC ~ 12.5k USDC.
                  await reducePoolReserves.call(this, Zero, USDC("75e4"));

                  // Calculate the amounts necessary for running the tests.
                  const calculatedAmounts = await getSeizeAndRepayAndProfitCollateralAmounts.call(
                    this,
                    repayHTokenAmount,
                    swapUnderlyingAmount,
                  );
                  expectedProfitCollateralAmount = calculatedAmounts.expectedProfitCollateralAmount;
                  repayCollateralAmount = calculatedAmounts.repayCollateralAmount;
                  seizeCollateralAmount = calculatedAmounts.seizeCollateralAmount;
                });

                context("new order of tokens in the UniswapV2Pair contract", function () {
                  let localToken0Amount: BigNumber;
                  let localToken1Amount: BigNumber;

                  beforeEach(async function () {
                    const token0: string = await this.contracts.uniswapV2Pair.token0();
                    if (token0 === this.contracts.wbtc.address) {
                      await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
                      await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
                      localToken0Amount = swapUnderlyingAmount;
                      localToken1Amount = swapCollateralAmount;
                    } else {
                      await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.wbtc.address);
                      await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.usdc.address);
                      localToken0Amount = swapCollateralAmount;
                      localToken1Amount = swapUnderlyingAmount;
                    }
                    await this.contracts.uniswapV2Pair.sync();
                  });

                  it("flash swaps USDC via and makes a WBTC profit", async function () {
                    const to: string = this.contracts.collateralFlashUniswapV2.address;
                    const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                    await this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(localToken0Amount, localToken1Amount, to, data);
                    const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                    expect(newCollateralBalance.sub(expectedProfitCollateralAmount)).to.equal(oldCollateralBalance);
                  });
                });

                context("initial order of tokens in the UniswapV2Pair contract", function () {
                  it("flash swaps USDC via and makes a WBTC profit", async function () {
                    const to: string = this.contracts.collateralFlashUniswapV2.address;
                    const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                    await this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(token0Amount, token1Amount, to, data);
                    const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                    expect(newCollateralBalance.sub(expectedProfitCollateralAmount)).to.equal(oldCollateralBalance);
                  });

                  it("emits a FlashSwapCollateralAndLiquidateBorrow event", async function () {
                    const to: string = this.contracts.collateralFlashUniswapV2.address;
                    const contractCall = this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(token0Amount, token1Amount, to, data);
                    await expect(contractCall)
                      .to.emit(this.contracts.collateralFlashUniswapV2, "FlashSwapCollateralAndLiquidateBorrow")
                      .withArgs(
                        this.signers.liquidator.address,
                        this.signers.borrower.address,
                        this.contracts.hToken.address,
                        swapUnderlyingAmount,
                        seizeCollateralAmount,
                        repayCollateralAmount,
                        Zero,
                        expectedProfitCollateralAmount,
                      );
                  });
                });
              });
            });
          });
        });
      });
    });
  });
}
