import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS, LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { BalanceSheetErrors, FlashUtilsErrors, UnderlyingFlashUniswapV2Errors } from "@hifi/errors";
import { USDC, WBTC, getNow, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";

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
  const types = ["address", "address", "address"];
  const values = [this.signers.borrower.address, this.contracts.hToken.address, this.signers.subsidizer.address];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
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

export function shouldBehaveLikeUniswapV2Call(): void {
  context("when the data is malformed", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const token0Amount: BigNumber = Zero;
      const token1Amount: BigNumber = Zero;
      const data: string = "0x";
      await expect(
        this.contracts.underlyingFlashUniswapV2
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
            this.contracts.underlyingFlashUniswapV2
              .connect(this.signers.raider)
              .uniswapV2Call(sender, token0Amount, token1Amount, data),
          ).to.be.revertedWith("function call to a non-contract account");
        });
      });

      context("when the caller is a malicious pair contract", function () {
        it("reverts", async function () {
          const to: string = this.contracts.underlyingFlashUniswapV2.address;
          await expect(
            this.contracts.maliciousPair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(UnderlyingFlashUniswapV2Errors.CallNotAuthorized);
        });
      });
    });

    context("when the caller is the UniswapV2Pair contract", function () {
      beforeEach(async function () {
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
          const to: string = this.contracts.underlyingFlashUniswapV2.address;
          await expect(
            this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(FlashUtilsErrors.UnderlyingNotInPool);
        });
      });

      context("when the underlying is part of the UniswapV2Pair contract", function () {
        context("when the other token is flash borrowed", function () {
          it("reverts", async function () {
            const { token0Amount, token1Amount } = await getTokenAmounts.call(this, WBTC("1"), Zero);
            const to: string = this.contracts.underlyingFlashUniswapV2.address;
            await expect(
              this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
            ).to.be.revertedWith(FlashUtilsErrors.FlashBorrowOtherToken);
          });
        });

        context("when underlying is flash borrowed", function () {
          const borrowAmount: BigNumber = hUSDC("10000");
          const collateralCeiling: BigNumber = USDC("1e6");
          const debtCeiling: BigNumber = hUSDC("1e6");
          const depositUnderlyingAmount: BigNumber = USDC("10000");
          const feeUnderlyingAmount: BigNumber = USDC("30.090271");
          const repayHTokenAmount: BigNumber = hUSDC("10000");
          const swapUnderlyingAmount: BigNumber = USDC("10000");
          const swapWbtcAmount: BigNumber = Zero;

          let token0Amount: BigNumber;
          let token1Amount: BigNumber;

          beforeEach(async function () {
            // Calculate the amount necessary for running the tests.
            const tokenAmounts = await getTokenAmounts.call(this, swapWbtcAmount, swapUnderlyingAmount);
            token0Amount = tokenAmounts.token0Amount;
            token1Amount = tokenAmounts.token1Amount;

            // List the bond in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

            // List the collateral in the Fintroller.
            await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.usdc.address);

            // Set the collateral ratio to 100%.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralRatio(this.contracts.usdc.address, COLLATERAL_RATIOS.lowerBound);

            // Set the liquidation incentive to 0%.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(this.contracts.usdc.address, LIQUIDATION_INCENTIVES.lowerBound);

            // Set the collateral ceiling.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralCeiling(this.contracts.usdc.address, collateralCeiling);

            // Set the debt ceiling.
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.contracts.hToken.address, debtCeiling);

            // Mint USDC and approve the BalanceSheet to spend it.
            await this.contracts.usdc.__godMode_mint(this.signers.borrower.address, depositUnderlyingAmount);
            await this.contracts.usdc
              .connect(this.signers.borrower)
              .approve(this.contracts.balanceSheet.address, MaxUint256);

            // Mint USDC to the subsidizer wallet and approve the flash swap contract to spend it.
            await this.contracts.usdc.__godMode_mint(this.signers.subsidizer.address, feeUnderlyingAmount);
            await this.contracts.usdc
              .connect(this.signers.subsidizer)
              .approve(this.contracts.underlyingFlashUniswapV2.address, MaxUint256);

            // Deposit USDC in the BalanceSheet.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.contracts.usdc.address, depositUnderlyingAmount);

            // Borrow hUSDC.
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .borrow(this.contracts.hToken.address, borrowAmount);
          });

          context("when the bond did not mature", function () {
            it("reverts", async function () {
              const { token0Amount, token1Amount } = await getTokenAmounts.call(this, Zero, USDC("10000"));
              const to: string = this.contracts.underlyingFlashUniswapV2.address;
              await expect(
                this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data),
              ).to.be.revertedWith(BalanceSheetErrors.NO_LIQUIDITY_SHORTFALL);
            });
          });

          context("when the bond matured", function () {
            beforeEach(async function () {
              const oneHourAgo: BigNumber = getNow().sub(3600);
              await this.contracts.hToken.connect(this.signers.admin).__godMode_setMaturity(oneHourAgo);
            });

            context("when the repay underlying amount is equal to the seized underlying amount", function () {
              const liquidationIncentive = toBn("1.003009027081243731");
              let expectedRepayUnderlyingAmount: BigNumber;
              let seizableUnderlyingAmount: BigNumber;

              beforeEach(async function () {
                // Mint 0.3% more USDC.
                const addedUnderlyingAmount: BigNumber = feeUnderlyingAmount;
                await this.contracts.usdc.__godMode_mint(this.signers.borrower.address, addedUnderlyingAmount);

                // Deposit the newly minted USDC in the vault.
                await this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.contracts.usdc.address, addedUnderlyingAmount);

                // Set the liquidation incentive to 0.3%.
                await this.contracts.fintroller
                  .connect(this.signers.admin)
                  .setLiquidationIncentive(this.contracts.usdc.address, liquidationIncentive);

                // Calculate the amounts necessary for running the tests.
                expectedRepayUnderlyingAmount = swapUnderlyingAmount.mul(1000).div(997).add(1);
                seizableUnderlyingAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
                  this.contracts.hToken.address,
                  repayHTokenAmount,
                  this.contracts.usdc.address,
                );
              });

              it("flash swaps USDC via and makes no USDC profit", async function () {
                const to: string = this.contracts.underlyingFlashUniswapV2.address;
                const oldUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                await this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data);
                const newUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                expect(newUsdcBalance).to.equal(oldUsdcBalance);
              });

              it("emits a FlashSwapUnderlyingAndLiquidateBorrow event", async function () {
                const to: string = this.contracts.underlyingFlashUniswapV2.address;
                const contractCall = this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data);
                await expect(contractCall)
                  .to.emit(this.contracts.underlyingFlashUniswapV2, "FlashSwapUnderlyingAndLiquidateBorrow")
                  .withArgs(
                    this.signers.liquidator.address,
                    this.signers.borrower.address,
                    this.contracts.hToken.address,
                    swapUnderlyingAmount,
                    seizableUnderlyingAmount,
                    expectedRepayUnderlyingAmount,
                    Zero,
                    Zero,
                  );
              });
            });

            context("when the repay underlying amount is less than the seized underlying amount", function () {
              let expectedProfitUnderlyingAmount: BigNumber;
              let expectedRepayUnderlyingAmount: BigNumber;
              let seizableUnderlyingAmount: BigNumber;

              beforeEach(async function () {
                // Mint 10% more USDC.
                const addedUnderlyingAmount: BigNumber = depositUnderlyingAmount.div(10);
                await this.contracts.usdc.__godMode_mint(this.signers.borrower.address, addedUnderlyingAmount);

                // Deposit the newly minted USDC in the vault.
                await this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.contracts.usdc.address, addedUnderlyingAmount);

                // Set the liquidation incentive to 10%.
                await this.contracts.fintroller
                  .connect(this.signers.admin)
                  .setLiquidationIncentive(this.contracts.usdc.address, LIQUIDATION_INCENTIVES.default);

                // Calculate the amounts necessary for running the tests.
                expectedRepayUnderlyingAmount = swapUnderlyingAmount.mul(1000).div(997).add(1);
                seizableUnderlyingAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
                  this.contracts.hToken.address,
                  repayHTokenAmount,
                  this.contracts.usdc.address,
                );
                expectedProfitUnderlyingAmount = seizableUnderlyingAmount.sub(expectedRepayUnderlyingAmount);
              });

              it("flash swaps USDC via and makes a USDC profit", async function () {
                const to: string = this.contracts.underlyingFlashUniswapV2.address;
                const oldUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                await this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data);
                const newUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                expect(newUsdcBalance.sub(expectedProfitUnderlyingAmount)).to.equal(oldUsdcBalance);
              });

              it("emits a FlashSwapUnderlyingAndLiquidateBorrow event", async function () {
                const to: string = this.contracts.underlyingFlashUniswapV2.address;
                const contractCall = this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data);
                await expect(contractCall)
                  .to.emit(this.contracts.underlyingFlashUniswapV2, "FlashSwapUnderlyingAndLiquidateBorrow")
                  .withArgs(
                    this.signers.liquidator.address,
                    this.signers.borrower.address,
                    this.contracts.hToken.address,
                    swapUnderlyingAmount,
                    seizableUnderlyingAmount,
                    expectedRepayUnderlyingAmount,
                    Zero,
                    expectedProfitUnderlyingAmount,
                  );
              });
            });

            context("when the repay underlying amount is greater than the seized underlying amount", function () {
              context("new order of tokens in the UniswapV2Pair contract", function () {
                let localToken0Amount: BigNumber;
                let localToken1Amount: BigNumber;

                beforeEach(async function () {
                  const token0: string = await this.contracts.uniswapV2Pair.token0();
                  if (token0 === this.contracts.wbtc.address) {
                    await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
                    await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
                    localToken0Amount = swapUnderlyingAmount;
                    localToken1Amount = swapWbtcAmount;
                  } else {
                    await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.wbtc.address);
                    await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.usdc.address);
                    localToken0Amount = swapWbtcAmount;
                    localToken1Amount = swapUnderlyingAmount;
                  }
                  await this.contracts.uniswapV2Pair.sync();
                });

                context("when the other token is flash borrowed", function () {
                  it("reverts", async function () {
                    const { token0Amount, token1Amount } = await getTokenAmounts.call(this, WBTC("1"), Zero);
                    const to: string = this.contracts.underlyingFlashUniswapV2.address;
                    await expect(
                      this.contracts.uniswapV2Pair
                        .connect(this.signers.raider)
                        .swap(token0Amount, token1Amount, to, data),
                    ).to.be.revertedWith(FlashUtilsErrors.FlashBorrowOtherToken);
                  });
                });

                context("when the underlying is flash borrowed", function () {
                  it("flash swaps USDC making no USDC profit and paying the flash swap fee", async function () {
                    const to: string = this.contracts.underlyingFlashUniswapV2.address;
                    const oldLiquidatorUsdcBalance = await this.contracts.usdc.balanceOf(
                      this.signers.liquidator.address,
                    );
                    const oldSubsidizerUsdcBalance = await this.contracts.usdc.balanceOf(
                      this.signers.subsidizer.address,
                    );
                    await this.contracts.uniswapV2Pair
                      .connect(this.signers.liquidator)
                      .swap(localToken0Amount, localToken1Amount, to, data);
                    const newLiquidatorUsdcBalance = await this.contracts.usdc.balanceOf(
                      this.signers.liquidator.address,
                    );
                    const newSubsidizerUsdcBalance = await this.contracts.usdc.balanceOf(
                      this.signers.subsidizer.address,
                    );
                    expect(newLiquidatorUsdcBalance).to.equal(oldLiquidatorUsdcBalance);
                    expect(oldSubsidizerUsdcBalance.sub(newSubsidizerUsdcBalance)).to.equal(feeUnderlyingAmount);
                  });
                });
              });

              context("initial order of tokens in the UniswapV2Pair contract", function () {
                let seizableUnderlyingAmount: BigNumber;
                let expectedRepayUnderlyingAmount: BigNumber;

                beforeEach(async function () {
                  // Calculate the amounts necessary for running the tests.
                  expectedRepayUnderlyingAmount = swapUnderlyingAmount.mul(1000).div(997).add(1);
                  seizableUnderlyingAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
                    this.contracts.hToken.address,
                    repayHTokenAmount,
                    this.contracts.usdc.address,
                  );
                });

                it("flash swaps USDC making no USDC profit and paying the flash swap fee", async function () {
                  const to: string = this.contracts.underlyingFlashUniswapV2.address;
                  const oldLiquidatorUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                  const oldSubsidizerUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.subsidizer.address);
                  await this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  const newLiquidatorUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
                  const newSubsidizerUsdcBalance = await this.contracts.usdc.balanceOf(this.signers.subsidizer.address);
                  expect(newLiquidatorUsdcBalance).to.equal(oldLiquidatorUsdcBalance);
                  expect(oldSubsidizerUsdcBalance.sub(newSubsidizerUsdcBalance)).to.equal(feeUnderlyingAmount);
                });

                it("emits a FlashSwapUnderlyingAndLiquidateBorrow event", async function () {
                  const to: string = this.contracts.underlyingFlashUniswapV2.address;
                  const contractCall = this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  await expect(contractCall)
                    .to.emit(this.contracts.underlyingFlashUniswapV2, "FlashSwapUnderlyingAndLiquidateBorrow")
                    .withArgs(
                      this.signers.liquidator.address,
                      this.signers.borrower.address,
                      this.contracts.hToken.address,
                      swapUnderlyingAmount,
                      seizableUnderlyingAmount,
                      expectedRepayUnderlyingAmount,
                      feeUnderlyingAmount,
                      Zero,
                    );
                });
              });
            });
          });
        });
      });
    });
  });
}
