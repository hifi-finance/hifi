import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { defaultAbiCoder } from "@ethersproject/abi";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors, HifiFlashSwapErrors } from "../../../../helpers/errors";
import {
  getWholeFyUsdcAmount,
  getWholeOraclePrice,
  getWholeUsdcAmount,
  getPartialWbtcAmount,
  getWholeWbtcAmount,
} from "../../../../helpers/math";
import { ten } from "../../../../helpers/constants";

const fyUsdc10k: BigNumber = getWholeFyUsdcAmount(10000);
const fyUsdc1m: BigNumber = getWholeFyUsdcAmount(1000000);
const p1: BigNumber = getWholeOraclePrice(1);
const p10k: BigNumber = getWholeOraclePrice(10000);
const p12dot5k: BigNumber = getWholeOraclePrice(12500);
const p20k: BigNumber = getWholeOraclePrice(20000);
const wbtc0dot001: BigNumber = getPartialWbtcAmount(1000);
const wbtc1: BigNumber = getWholeWbtcAmount(1);

async function bumpPoolReserves(
  this: Mocha.Context,
  wbtcAmount: BigNumberish,
  usdcAmount: BigNumberish,
): Promise<void> {
  wbtcAmount = getWholeWbtcAmount(wbtcAmount);
  usdcAmount = getWholeUsdcAmount(usdcAmount);

  // Mint WBTC to the pool.
  if (wbtcAmount.isZero() == false) {
    await this.contracts.wbtc.mint(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pool.
  if (usdcAmount.isZero() == false) {
    await this.contracts.usdc.mint(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.
  await this.contracts.uniswapV2Pair.sync();
}

function encodeData(this: Mocha.Context, minProfit: string): string {
  const types = ["address", "address", "uint256"];
  const values = [this.contracts.fyToken.address, this.signers.borrower.address, minProfit];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

async function reducePoolReserves(
  this: Mocha.Context,
  wbtcAmount: BigNumberish,
  usdcAmount: BigNumberish,
): Promise<void> {
  wbtcAmount = getWholeWbtcAmount(wbtcAmount);
  usdcAmount = getWholeUsdcAmount(usdcAmount);

  // Mint WBTC to the pool.
  if (wbtcAmount.isZero() == false) {
    await this.contracts.wbtc.burn(this.contracts.uniswapV2Pair.address, wbtcAmount);
  }

  // Mint USDC to the pool.
  if (usdcAmount.isZero() == false) {
    await this.contracts.usdc.burn(this.contracts.uniswapV2Pair.address, usdcAmount);
  }

  // Sync the token reserves in the UniswapV2Pair contract.

  await this.contracts.uniswapV2Pair.sync();
}

export default function shouldBehaveLikeUniswapV2Call(): void {
  describe("when the caller is not the UniswapV2Pair contract", function () {
    it("reverts", async function () {
      const sender: string = this.signers.raider.address;
      const wbtcAmount: BigNumber = Zero;
      const usdcAmount: BigNumber = BigNumber.from(20000);
      const data: string = "0x";
      await expect(
        this.contracts.hifiFlashSwap.connect(this.signers.raider).uniswapV2Call(sender, wbtcAmount, usdcAmount, data),
      ).to.be.revertedWith(HifiFlashSwapErrors.UniswapV2PairCallNotAuthorized);
    });
  });

  describe("when the caller is the UniswapV2Pair contract", function () {
    beforeEach(async function () {
      // Set the oracle price to 1 WBTC = $20k.
      await this.contracts.wbtcPriceFeed.setPrice(p20k);

      // Set the oracle price to 1 USDC = $1.
      await this.contracts.usdcPriceFeed.setPrice(p1);

      // Mint 100 WBTC and 2m USDC to the pool, which makes the price 1 WBTC ~ 20k USDC.
      await bumpPoolReserves.call(this, 100, 2000000);
    });

    describe("when the wbtc amount is non-zero", function () {
      const wbtcAmount: BigNumber = BigNumber.from(1);

      it("reverts", async function () {
        const usdcAmount: BigNumber = BigNumber.from(20000);
        const to: string = this.contracts.hifiFlashSwap.address;
        const data: string = "0xcafe";
        await expect(
          this.contracts.uniswapV2Pair.connect(this.signers.raider).swap(wbtcAmount, usdcAmount, to, data),
        ).to.be.revertedWith(HifiFlashSwapErrors.WbtcAmountZero);
      });
    });

    describe("when the wbtc amount is zero", function () {
      const usdcAmount: BigNumber = getWholeUsdcAmount(10000);
      const wbtcAmount: BigNumber = Zero;

      beforeEach(async function () {
        // List the bond in the Fintroller.
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.fyToken.address);

        // Set the liquidation incentive to 110%.
        const liquidationIncentiveMantissa: BigNumber = ten.pow(18).add(ten.pow(17));
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setLiquidationIncentive(liquidationIncentiveMantissa);

        // Set the debt ceiling to 1m fyUSDC.
        const debtCeiling: BigNumber = fyUsdc1m;
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setBondDebtCeiling(this.contracts.fyToken.address, debtCeiling);

        // Mint 1 WBTC and approve the Balance Sheet to spend it all.
        await this.contracts.wbtc.mint(this.signers.borrower.address, wbtc1);
        await this.contracts.wbtc.connect(this.signers.borrower).approve(this.contracts.balanceSheet.address, wbtc1);

        // Open the vault.
        await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.fyToken.address);

        // Deposit the 1 WBTC in the Balance Sheet.
        await this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .depositCollateral(this.contracts.fyToken.address, wbtc1);

        // Lock the 1 WBTC in the vault.
        await this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .lockCollateral(this.contracts.fyToken.address, wbtc1);

        // Borrow 10k fyUSDC.
        const borrowAmount: BigNumber = fyUsdc10k;
        await this.contracts.fyToken.connect(this.signers.borrower).borrow(borrowAmount);
      });

      describe("when the borrower is not underwater", function () {
        it("reverts", async function () {
          const to: string = this.contracts.hifiFlashSwap.address;
          const minProfit: string = wbtc0dot001.toString();
          const data: string = encodeData.call(this, minProfit);
          await expect(
            this.contracts.uniswapV2Pair.connect(this.signers.liquidator).swap(wbtcAmount, usdcAmount, to, data),
          ).to.be.revertedWith(GenericErrors.AccountNotUnderwater);
        });
      });

      describe("when the borrower is underwater", function () {
        describe("when the collateralization ratio is lower than 110%", function () {
          beforeEach(async function () {
            // Set the WBTC price to $10k to make borrower's collateralization ratio 100%.
            await this.contracts.wbtcPriceFeed.setPrice(p10k);
          });

          it("reverts", async function () {
            const to: string = this.contracts.hifiFlashSwap.address;
            const minProfit: string = wbtc0dot001.toString();
            const data: string = encodeData.call(this, minProfit);
            const contractCall = this.contracts.uniswapV2Pair
              .connect(this.signers.liquidator)
              .swap(wbtcAmount, usdcAmount, to, data);
            await expect(contractCall).to.be.revertedWith(BalanceSheetErrors.InsufficientLockedCollateral);
          });
        });

        describe("when the collateralization ratio is lower than 150% but higher than 110%", function () {
          beforeEach(async function () {
            // Set the WBTC price to $12.5k to make borrower's collateralization ratio 125%.
            await this.contracts.wbtcPriceFeed.setPrice(p12dot5k);
          });

          describe("when the pool price is better than the oracle price", function () {
            beforeEach(async function () {
              // Burn 1m USDC from the pool, which makes the price 1 WBTC ~ 10k USDC.
              await reducePoolReserves.call(this, 0, 1000000);
            });

            it("reverts", async function () {
              const to: string = this.contracts.hifiFlashSwap.address;
              const minProfit: string = wbtc0dot001.toString();
              const data: string = encodeData.call(this, minProfit);
              const contractCall = this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(wbtcAmount, usdcAmount, to, data);
              await expect(contractCall).to.be.revertedWith(HifiFlashSwapErrors.InsufficientProfit);
            });
          });

          describe("when the pool price is the same as the oracle price", function () {
            beforeEach(async function () {
              // Burn 750k USDC from the pool, which makes the price 1 WBTC ~ 12.5k USDC.
              await reducePoolReserves.call(this, 0, 750000);
            });

            it("flas swaps USDC via Uniswap and makes a WBTC profit via Hifi", async function () {
              const repayFyUsdcAmount: BigNumber = fyUsdc10k;
              const clutchableWbtcAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
                this.contracts.fyToken.address,
                repayFyUsdcAmount,
              );
              const repayWbtcAmount: BigNumber = await this.contracts.hifiFlashSwap.getRepayWbtcAmount(usdcAmount);
              const expectedWbtcProfit = clutchableWbtcAmount.sub(repayWbtcAmount);

              const to: string = this.contracts.hifiFlashSwap.address;
              const minProfit = wbtc0dot001.toString();
              const data: string = encodeData.call(this, minProfit);

              const oldWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
              await this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(wbtcAmount, usdcAmount, to, data);
              const newWbtcBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
              expect(oldWbtcBalance).to.equal(newWbtcBalance.sub(expectedWbtcProfit));
            });

            it("emits a FlashLiquidate event", async function () {
              const repayFyUsdcAmount: BigNumber = fyUsdc10k;
              const clutchableWbtcAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
                this.contracts.fyToken.address,
                repayFyUsdcAmount,
              );
              const repayWbtcAmount: BigNumber = await this.contracts.hifiFlashSwap.getRepayWbtcAmount(usdcAmount);
              const expectedWbtcProfit = clutchableWbtcAmount.sub(repayWbtcAmount);

              const to: string = this.contracts.hifiFlashSwap.address;
              const minProfit: string = wbtc0dot001.toString();
              const data: string = encodeData.call(this, minProfit);

              const contractCall = this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(wbtcAmount, usdcAmount, to, data);
              await expect(contractCall)
                .to.emit(this.contracts.hifiFlashSwap, "FlashLiquidate")
                .withArgs(
                  this.signers.liquidator.address,
                  this.signers.borrower.address,
                  this.contracts.fyToken.address,
                  usdcAmount,
                  fyUsdc10k,
                  clutchableWbtcAmount,
                  expectedWbtcProfit,
                );
            });
          });
        });
      });
    });
  });
}
