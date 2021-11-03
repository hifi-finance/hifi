import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { BalanceSheetErrors, HifiFlashUniswapV2UnderlyingErrors } from "@hifi/errors";
import { USDC, WBTC, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";

import type { GodModeErc20 } from "../../../../src/types/GodModeErc20";
import { deployGodModeErc20 } from "../../../shared/deployers";

async function bumpPoolReserves(this: Mocha.Context, wbtcAmount: BigNumber, usdcAmount: BigNumber): Promise<void> {
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
  const types = ["address", "address"];
  const values = [this.signers.borrower.address, this.contracts.hToken.address];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

async function getSeizableAndRepayCollateralAmounts(
  this: Mocha.Context,
  repayHUsdcAmount: BigNumber,
  underlyingAmount: BigNumber,
): Promise<{ expectedRepayUsdcAmount: BigNumber; seizableUsdcAmount: BigNumber }> {
  const seizableUsdcAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
    this.contracts.hToken.address,
    repayHUsdcAmount,
    this.contracts.usdc.address,
  );
  const expectedRepayUsdcAmount = underlyingAmount.mul(1000).div(997).add(1);
  return { expectedRepayUsdcAmount, seizableUsdcAmount };
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
        this.contracts.hifiFlashUniswapV2Underlying
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
            this.contracts.hifiFlashUniswapV2Underlying
              .connect(this.signers.raider)
              .uniswapV2Call(sender, token0Amount, token1Amount, data),
          ).to.be.revertedWith("function call to a non-contract account");
        });
      });

      context("when the caller is a malicious pair", function () {
        it("reverts", async function () {
          const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
          await expect(
            this.contracts.maliciousPair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(HifiFlashUniswapV2UnderlyingErrors.CallNotAuthorized);
        });
      });
    });

    context("when the caller is the pair contract", function () {
      beforeEach(async function () {
        // Set the oracle price to 1 WBTC = $20k.
        await this.contracts.wbtcPriceFeed.setPrice(price("20000"));

        // Set the oracle price to 1 USDC = $1.
        await this.contracts.usdcPriceFeed.setPrice(price("1"));

        // Mint 100 WBTC and 2m USDC to the pair contract. This makes the price 1 WBTC ~ 20k USDC.
        await bumpPoolReserves.call(this, WBTC("100"), USDC("2e6"));
      });

      context("when the underlying is not in the pair contract", function () {
        it("reverts", async function () {
          const { token0Amount, token1Amount } = await getTokenAmounts.call(this, Zero, USDC("10000"));
          const foo: GodModeErc20 = await deployGodModeErc20(this.signers.admin, "Foo", "FOO", BigNumber.from(18));
          await this.contracts.hToken.__godMode_setUnderlying(foo.address);
          const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
          await expect(
            this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(HifiFlashUniswapV2UnderlyingErrors.UnderlyingNotInPool);
        });
      });

      context("when the underlying is in the pair contract", function () {
        context("when wrong token is flash borrowed", function () {
          it("reverts", async function () {
            const { token0Amount, token1Amount } = await getTokenAmounts.call(this, WBTC("1"), Zero);
            const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
            await expect(
              this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
            ).to.be.revertedWith(HifiFlashUniswapV2UnderlyingErrors.FlashBorrowWrongToken);
          });
        });

        context("when underlying is flash borrowed", function () {
          const borrowAmount: BigNumber = hUSDC("10000");
          const collateralAmount: BigNumber = Zero;
          const usdcCollateralCeiling: BigNumber = USDC("1000000");
          const wbtcCollateralCeiling: BigNumber = WBTC("50");
          const debtCeiling: BigNumber = hUSDC("1e6");
          const usdcLiquidationIncentive: BigNumber = toBn("1");
          const wbtcLiquidationIncentive: BigNumber = toBn("1.10");
          const underlyingAmount: BigNumber = USDC("10000");
          const usdcDepositAmount: BigNumber = USDC("10000");
          const usdcRepayFeeAmount: BigNumber = USDC("30.090271");
          const wbtcDepositAmount: BigNumber = WBTC("0.5");

          let token0Amount: BigNumber;
          let token1Amount: BigNumber;

          beforeEach(async function () {
            const tokenAmounts = await getTokenAmounts.call(this, collateralAmount, underlyingAmount);
            token0Amount = tokenAmounts.token0Amount;
            token1Amount = tokenAmounts.token1Amount;

            // List the bond in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

            // List the collaterals in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.usdc.address);
            await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

            // Set the liquidation incentives.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(this.contracts.usdc.address, usdcLiquidationIncentive);
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(this.contracts.wbtc.address, wbtcLiquidationIncentive);

            // Set the collateral ceilings.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralCeiling(this.contracts.usdc.address, usdcCollateralCeiling);
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralCeiling(this.contracts.wbtc.address, wbtcCollateralCeiling);

            // Set the debt ceiling.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.contracts.hToken.address, debtCeiling);

            // Mint USDC and approve the BalanceSheet to spend it.
            await this.contracts.usdc.__godMode_mint(this.signers.borrower.address, usdcDepositAmount);
            await this.contracts.usdc
              .connect(this.signers.borrower)
              .approve(this.contracts.balanceSheet.address, usdcDepositAmount);

            // Mint WBTC and approve the BalanceSheet to spend it.
            await this.contracts.wbtc.__godMode_mint(this.signers.borrower.address, wbtcDepositAmount);
            await this.contracts.wbtc
              .connect(this.signers.borrower)
              .approve(this.contracts.balanceSheet.address, wbtcDepositAmount);

            // Minst USDC and send it to flash-swap to be used for Uniswap V2 fee repay
            await this.contracts.usdc.__godMode_mint(
              this.contracts.hifiFlashUniswapV2Underlying.address,
              usdcRepayFeeAmount,
            );

            // Deposit the USDC in the BalanceSheet.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.contracts.usdc.address, usdcDepositAmount);

            // Deposit the WBTC in the BalanceSheet.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.contracts.wbtc.address, wbtcDepositAmount);

            // Borrow hUSDC.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .borrow(this.contracts.hToken.address, borrowAmount);
          });

          context("when the borrower does not have a liquidity shortfall", function () {
            it("reverts", async function () {
              const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
              await expect(
                this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data),
              ).to.be.revertedWith(BalanceSheetErrors.NO_LIQUIDITY_SHORTFALL);
            });
          });

          context("when the price given by the pair contract price is better than the oracle price", function () {
            beforeEach(async function () {
              // Set the WBTC price to $5k to make borrower's collateral ratio 125%.
              await this.contracts.wbtcPriceFeed.setPrice(price("5000"));

              // Burn 1.75m USDC from the pair contract. This makes the pair contract price 1 WBTC ~ 2.5k USDC.
              await reducePoolReserves.call(this, Zero, USDC("1.75e6"));
            });

            it("flash swaps USDC making no USDC profit and spending allocated USDC to pay swap fee", async function () {
              const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
              const preUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
              const preUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
              await this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(token0Amount, token1Amount, to, data);
              const newUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
              const newUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
              expect(newUsdcBalanceAccount).to.equal(preUsdcBalanceAccount);
              expect(preUsdcBalanceContract.sub(newUsdcBalanceContract)).to.equal(usdcRepayFeeAmount);
            });
          });

          context("when the borrower has a liquidity shortfall", function () {
            context("when the price given by the pair contract is the same as the oracle price", function () {
              let seizableUsdcAmount: BigNumber;
              let expectedRepayUsdcAmount: BigNumber;

              context("when the collateral ratio is lower than 110%", function () {
                const repayHUsdcAmount: BigNumber = hUSDC("9090.909090909090909090");

                beforeEach(async function () {
                  // Set the WBTC price to $10k to make the borrower's collateral ratio 100%.
                  await this.contracts.wbtcPriceFeed.setPrice(price("10000"));

                  // Calculate the amounts necessary for running the tests.
                  const calculatesAmounts = await getSeizableAndRepayCollateralAmounts.call(
                    this,
                    repayHUsdcAmount,
                    underlyingAmount,
                  );
                  seizableUsdcAmount = calculatesAmounts.seizableUsdcAmount;
                });

                it("flash swaps USDC making no USDC profit and spending allocated USDC to pay swap fee", async function () {
                  const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
                  const preUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                  const preUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                  await this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  const newUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                  const newUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                  expect(newUsdcBalanceAccount).to.equal(preUsdcBalanceAccount);
                  expect(preUsdcBalanceContract.sub(newUsdcBalanceContract)).to.equal(usdcRepayFeeAmount);
                });
              });

              context("when the collateral ratio is lower than 150% but higher than 110%", function () {
                const repayHUsdcAmount: BigNumber = hUSDC("10000");

                beforeEach(async function () {
                  // Set the WBTC price to $5k to make borrower's collateral ratio 125%.
                  await this.contracts.wbtcPriceFeed.setPrice(price("5000"));

                  // Burn 1.5m USDC from the pair contract, which makes the price 1 WBTC ~ 5k USDC.
                  await reducePoolReserves.call(this, Zero, USDC("1.5e6"));

                  // Calculate the amounts necessary for running the tests.
                  const calculatesAmounts = await getSeizableAndRepayCollateralAmounts.call(
                    this,
                    repayHUsdcAmount,
                    underlyingAmount,
                  );
                  seizableUsdcAmount = calculatesAmounts.seizableUsdcAmount;
                  expectedRepayUsdcAmount = calculatesAmounts.expectedRepayUsdcAmount;
                });

                context("new order of tokens in the pair", function () {
                  let localToken0Amount: BigNumber;
                  let localToken1Amount: BigNumber;

                  beforeEach(async function () {
                    const token0: string = await this.contracts.uniswapV2Pair.token0();
                    if (token0 == this.contracts.wbtc.address) {
                      await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
                      await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
                      localToken0Amount = underlyingAmount;
                      localToken1Amount = collateralAmount;
                    } else {
                      await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.wbtc.address);
                      await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.usdc.address);
                      localToken0Amount = collateralAmount;
                      localToken1Amount = underlyingAmount;
                    }
                    await this.contracts.uniswapV2Pair.sync();
                  });

                  it("flash swaps USDC making no USDC profit and spending allocated USDC to pay swap fee", async function () {
                    const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
                    const preUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                    const preUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                    await this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(localToken0Amount, localToken1Amount, to, data);
                    const newUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                    const newUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                    expect(newUsdcBalanceAccount).to.equal(preUsdcBalanceAccount);
                    expect(preUsdcBalanceContract.sub(newUsdcBalanceContract)).to.equal(usdcRepayFeeAmount);
                  });
                });

                context("initial order of tokens in the pair", function () {
                  it("flash swaps USDC making no USDC profit and spending allocated USDC to pay swap fee", async function () {
                    const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
                    const preUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                    const preUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                    await this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(token0Amount, token1Amount, to, data);
                    const newUsdcBalanceAccount = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                    const newUsdcBalanceContract = await this.contracts.usdc.balanceOf(to);
                    expect(newUsdcBalanceAccount).to.equal(preUsdcBalanceAccount);
                    expect(preUsdcBalanceContract.sub(newUsdcBalanceContract)).to.equal(usdcRepayFeeAmount);
                  });

                  it("emits a FlashLiquidateBorrow event", async function () {
                    const to: string = this.contracts.hifiFlashUniswapV2Underlying.address;
                    const contractCall = this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(token0Amount, token1Amount, to, data);
                    await expect(contractCall)
                      .to.emit(this.contracts.hifiFlashUniswapV2Underlying, "FlashLiquidateBorrow")
                      .withArgs(
                        this.signers.liquidator.address,
                        this.signers.borrower.address,
                        this.contracts.hToken.address,
                        underlyingAmount,
                        seizableUsdcAmount,
                        expectedRepayUsdcAmount,
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
