import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { USDC, WBTC, bn, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";

import { GodModeErc20 } from "../../../../typechain";
import { deployGodModeErc20 } from "../../../shared/deployers";
import { HifiFlashUniswapV2Errors } from "../../../shared/errors";

async function bumpPoolReserves(this: Mocha.Context, wbtcAmount: BigNumber, usdcAmount: BigNumber): Promise<void> {
  // Mint WBTC to the pool.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.mint(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pool.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.mint(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

function encodeCallData(this: Mocha.Context): string {
  const types = ["address", "address", "uint256"];
  const minProfit: string = String(WBTC("0.001"));
  const values = [this.signers.borrower.address, this.contracts.hToken.address, minProfit];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

async function reducePoolReserves(this: Mocha.Context, wbtcAmount: BigNumber, usdcAmount: BigNumber): Promise<void> {
  // Mint WBTC to the pool.
  if (!wbtcAmount.isZero()) {
    await this.contracts.wbtc.burn(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pool.
  if (!usdcAmount.isZero()) {
    await this.contracts.usdc.burn(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

export default function shouldBehaveLikeUniswapV2Call(): void {
  context("when the caller is not the UniswapV2Pair contract", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const token0Amount: BigNumber = Zero;
      const token1Amount: BigNumber = USDC("20000");
      const data: string = "0x";
      await expect(
        this.contracts.hifiFlashUniswapV2
          .connect(this.signers.raider)
          .uniswapV2Call(sender, token0Amount, token1Amount, data),
      ).to.be.revertedWith(HifiFlashUniswapV2Errors.CallNotAuthorized);
    });
  });

  context("when the caller is the UniswapV2Pair contract", function () {
    beforeEach(async function () {
      // Set the oracle price to 1 WBTC = $20k.
      await this.contracts.wbtcPriceFeed.setPrice(price("20000"));

      // Set the oracle price to 1 USDC = $1.
      await this.contracts.usdcPriceFeed.setPrice(price("1"));

      // Mint 100 WBTC and 2m USDC to the pool, which makes the price 1 WBTC ~ 20k USDC.
      await bumpPoolReserves.call(this, WBTC("100"), USDC("2e6"));
    });

    context("when the underlying is not in the pool", function () {
      const token1Amount: BigNumber = USDC("10000");
      const token0Amount: BigNumber = Zero;

      it("reverts", async function () {
        const foo: GodModeErc20 = await deployGodModeErc20(this.signers.admin, "Foo", "FOO", bn("18"));
        await this.contracts.hToken.__godMode_setUnderlying(foo.address);
        const to: string = this.contracts.hifiFlashUniswapV2.address;
        const data: string = encodeCallData.call(this);
        await expect(
          this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
        ).to.be.revertedWith(HifiFlashUniswapV2Errors.UnderlyingNotInPool);
      });
    });

    context("when the underlying is in the pool", function () {
      context("when collateral is flash borrowed", function () {
        const token0Amount: BigNumber = WBTC("1");
        const token1Amount: BigNumber = Zero;

        it("reverts", async function () {
          const to: string = this.contracts.hifiFlashUniswapV2.address;
          const data: string = encodeCallData.call(this);
          await expect(
            this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(token0Amount, token1Amount, to, data),
          ).to.be.revertedWith(HifiFlashUniswapV2Errors.FlashBorrowCollateral);
        });
      });

      context("when underlying is flash borrowed", function () {
        const borrowAmount: BigNumber = hUSDC("10000");
        const debtCeiling: BigNumber = hUSDC("1e6");
        const liquidationIncentive: BigNumber = fp("1.10");
        const token0Amount: BigNumber = Zero;
        const token1Amount: BigNumber = USDC("10000");
        const wbtcDepositAmount: BigNumber = WBTC("1");

        beforeEach(async function () {
          // List the bond in the Fintroller.
          await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

          // List the collateral in the Fintroller.
          await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

          // Set the liquidation incentive.
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setLiquidationIncentive(this.contracts.wbtc.address, liquidationIncentive);

          // Set the debt ceiling.
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.contracts.hToken.address, debtCeiling);

          // Mint WBTC and approve the Balance Sheet to spend it.
          await this.contracts.wbtc.mint(this.signers.borrower.address, wbtcDepositAmount);
          await this.contracts.wbtc
            .connect(this.signers.borrower)
            .approve(this.contracts.balanceSheet.address, wbtcDepositAmount);

          // Deposit the WBTC in the Balance Sheet.
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
            const to: string = this.contracts.hifiFlashUniswapV2.address;
            const data: string = encodeCallData.call(this);
            // TODO: change the revert reason with a BalanceSheet error once Hardhat patches the bug.
            await expect(
              this.contracts.uniswapV2Pair.connect(this.signers.liquidator).swap(token0Amount, token1Amount, to, data),
            ).to.be.revertedWith("Transaction reverted without a reason string");
          });
        });

        context("when the borrower has a liquidity shortfall", function () {
          context("when the collateralization ratio is lower than 110%", function () {
            beforeEach(async function () {
              // Set the WBTC price to $10k to make the borrower's collateralization ratio 100%.
              await this.contracts.wbtcPriceFeed.setPrice(price("10000"));
            });

            it("reverts", async function () {
              const to: string = this.contracts.hifiFlashUniswapV2.address;
              const data: string = encodeCallData.call(this);
              // TODO: change the revert reason with a BalanceSheet error once Hardhat patches the bug.
              await expect(
                this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(token0Amount, token1Amount, to, data),
              ).to.be.revertedWith("Transaction reverted without a reason string");
            });
          });

          context("when the collateralization ratio is lower than 150% but higher than 110%", function () {
            beforeEach(async function () {
              // Set the WBTC price to $12.5k to make borrower's collateralization ratio 125%.
              await this.contracts.wbtcPriceFeed.setPrice(price("12500"));
            });

            context("when the pool price is better than the oracle price", function () {
              beforeEach(async function () {
                // Burn 1m USDC from the pool, which makes the pool price 1 WBTC ~ 10k USDC.
                await reducePoolReserves.call(this, Zero, USDC("1e6"));
              });

              it("reverts", async function () {
                const to: string = this.contracts.hifiFlashUniswapV2.address;
                const data: string = encodeCallData.call(this);
                await expect(
                  this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data),
                ).to.be.revertedWith(HifiFlashUniswapV2Errors.InsufficientProfit);
              });
            });

            context("when the pool price is the same as the oracle price", function () {
              const repayHUsdcAmount: BigNumber = hUSDC("10000");
              let expectedProfitWbtcAmount: BigNumber;
              let repayWbtcAmount: BigNumber;
              let seizableWbtcAmount: BigNumber;

              beforeEach(async function () {
                // Burn 750k USDC from the pool, which makes the price 1 WBTC ~ 12.5k USDC.
                await reducePoolReserves.call(this, Zero, USDC("75e4"));

                // Calculate the amounts necessary for running the tests.
                seizableWbtcAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
                  this.contracts.hToken.address,
                  repayHUsdcAmount,
                  this.contracts.wbtc.address,
                );
                repayWbtcAmount = await this.contracts.hifiFlashUniswapV2.getRepayCollateralAmount(
                  this.contracts.uniswapV2Pair.address,
                  this.contracts.usdc.address,
                  token1Amount,
                );
                expectedProfitWbtcAmount = seizableWbtcAmount.sub(repayWbtcAmount);
              });

              context("when the token0 is the underlying", function () {
                const localToken0Amount: BigNumber = USDC("10000");
                const localToken1Amount: BigNumber = WBTC("0");

                beforeEach(async function () {
                  await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
                  await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
                  await this.contracts.uniswapV2Pair.sync();
                });

                it("flash swaps USDC and makes a WBTC profit", async function () {
                  const to: string = this.contracts.hifiFlashUniswapV2.address;
                  const data: string = encodeCallData.call(this);

                  const oldWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  await this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(localToken0Amount, localToken1Amount, to, data);
                  const newWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  expect(newWbtcBalance.sub(expectedProfitWbtcAmount)).to.equal(oldWbtcBalance);
                });
              });

              context("when the token0 is the collateral", function () {
                it("flash swaps USDC via and makes a WBTC profit", async function () {
                  const to: string = this.contracts.hifiFlashUniswapV2.address;
                  const data: string = encodeCallData.call(this);

                  const oldWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  await this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  const newWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                  expect(newWbtcBalance.sub(expectedProfitWbtcAmount)).to.equal(oldWbtcBalance);
                });

                it("emits a FlashLiquidateBorrow event", async function () {
                  const to: string = this.contracts.hifiFlashUniswapV2.address;
                  const data: string = encodeCallData.call(this);

                  const contractCall = this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(token0Amount, token1Amount, to, data);
                  await expect(contractCall)
                    .to.emit(this.contracts.hifiFlashUniswapV2, "FlashLiquidateBorrow")
                    .withArgs(
                      this.signers.liquidator.address,
                      this.signers.borrower.address,
                      this.contracts.hToken.address,
                      token1Amount,
                      seizableWbtcAmount,
                      expectedProfitWbtcAmount,
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
