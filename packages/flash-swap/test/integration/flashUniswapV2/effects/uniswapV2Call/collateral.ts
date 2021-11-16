import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { MaxUint256 } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { BalanceSheetErrors, FlashUniswapV2Errors } from "@hifi/errors";
import { USDC, WBTC, getNow, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";

import { increasePoolReserves, reducePoolReserves } from "../../../../shared/helpers";

function getFlashSwapCallData(this: Mocha.Context, turnout: BigNumber = WBTC("0.001")): string {
  const types = ["address", "address", "address", "int256"];
  const borrower: string = this.signers.borrower.address;
  const bond: string = this.contracts.hToken.address;
  const collateral: string = this.contracts.wbtc.address;
  const values = [borrower, bond, collateral, String(turnout)];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

export function shouldBehaveLikeCollateralFlashSwap(): void {
  const borrowAmount: BigNumber = hUSDC("10000");
  const collateralCeiling: BigNumber = USDC("1e6");
  const debtCeiling: BigNumber = hUSDC("1e6");
  const profitCollateralAmount: BigNumber = WBTC("0.07112175"); // based on 125% collateralization ratio
  const depositCollateralAmount: BigNumber = WBTC("1");
  const subsidyCollateralAmount: BigNumber = WBTC("0.01314044");
  const swapCollateralAmount: BigNumber = Zero;
  const swapUnderlyingAmount: BigNumber = USDC("10000");

  beforeEach(async function () {
    // Set the oracle price to 1 WBTC = $20k.
    await this.contracts.wbtcPriceFeed.setPrice(price("20000"));

    // Set the oracle price to 1 USDC = $1.
    await this.contracts.usdcPriceFeed.setPrice(price("1"));

    // Mint 100 WBTC and 2m USDC to the pair contract. This makes the price 1 WBTC ~ 20k USDC.
    await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));

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

    // Mint WBTC to the borrower's wallet and approve the BalanceSheet to spend it.
    await this.contracts.wbtc.__godMode_mint(this.signers.borrower.address, depositCollateralAmount);
    await this.contracts.wbtc.connect(this.signers.borrower).approve(this.contracts.balanceSheet.address, MaxUint256);

    // Mint WBTC to the liquidator's wallet and approve the flash swap contract to spend it.
    await this.contracts.wbtc.__godMode_mint(this.signers.liquidator.address, subsidyCollateralAmount);
    await this.contracts.wbtc
      .connect(this.signers.liquidator)
      .approve(this.contracts.flashUniswapV2.address, MaxUint256);

    // Deposit the WBTC in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.wbtc.address, depositCollateralAmount);

    // Borrow hUSDC.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .borrow(this.contracts.hToken.address, borrowAmount);
  });

  context("new order of tokens in the UniswapV2Pair contract", function () {
    beforeEach(async function () {
      await this.contracts.uniswapV2Pair.__godMode_setToken0(this.contracts.usdc.address);
      await this.contracts.uniswapV2Pair.__godMode_setToken1(this.contracts.wbtc.address);
      await this.contracts.uniswapV2Pair.sync();

      await this.contracts.wbtcPriceFeed.setPrice(price("12500"));
      await reducePoolReserves.call(this, Zero, USDC("75e4"));
    });

    it("flash swaps USDC and makes a WBTC profit", async function () {
      const to: string = this.contracts.flashUniswapV2.address;
      const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
      const data: string = getFlashSwapCallData.call(this);
      await this.contracts.uniswapV2Pair
        .connect(this.signers.liquidator)
        .swap(swapUnderlyingAmount, swapCollateralAmount, to, data);
      const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
      expect(newCollateralBalance.sub(profitCollateralAmount)).to.equal(oldCollateralBalance);
    });
  });

  context("initial order of tokens in the UniswapV2Pair contract", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hToken.connect(this.signers.admin).__godMode_setMaturity(oneHourAgo);

        await this.contracts.wbtcPriceFeed.setPrice(price("12500"));
        await reducePoolReserves.call(this, Zero, USDC("75e4"));
      });

      it("flash swaps USDC and makes a WBTC profit", async function () {
        const to: string = this.contracts.flashUniswapV2.address;
        const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
        const data: string = getFlashSwapCallData.call(this);
        await this.contracts.uniswapV2Pair
          .connect(this.signers.liquidator)
          .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
        const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
        expect(newCollateralBalance.sub(profitCollateralAmount)).to.equal(oldCollateralBalance);
      });
    });

    context("when the bond did not mature", function () {
      context("when the borrower does not have a liquidity shortfall", function () {
        it("reverts", async function () {
          const to: string = this.contracts.flashUniswapV2.address;
          const data: string = getFlashSwapCallData.call(this);
          await expect(
            this.contracts.uniswapV2Pair
              .connect(this.signers.liquidator)
              .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
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
              const to: string = this.contracts.flashUniswapV2.address;
              const data: string = getFlashSwapCallData.call(this);
              await expect(
                this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
              ).to.be.revertedWith(FlashUniswapV2Errors.TURNOUT_NOT_SATISFIED);
            });
          },
        );

        context("when the price given by the UniswapV2Pair contract is the same as the oracle price", function () {
          context("when the repay amount is equal to the seized amount", function () {
            const liquidationIncentive = toBn("1.01314044");
            const repayCollateralAmount: BigNumber = WBTC("1.01314044");
            const seizeCollateralAmount: BigNumber = WBTC("1.01314044");

            let data: string;

            beforeEach(async function () {
              data = getFlashSwapCallData.call(this, Zero);

              // Mint 0.3% more WBTC.
              await this.contracts.wbtc.__godMode_mint(this.signers.borrower.address, subsidyCollateralAmount);

              // Deposit the newly minted WBTC in the vault.
              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .depositCollateral(this.contracts.wbtc.address, subsidyCollateralAmount);

              // Set the WBTC price to $10k to make borrower's collateral ratio 100%.
              await this.contracts.wbtcPriceFeed.setPrice(price("10000"));

              // Burn 1m USDC from the pair contract, which makes the price 1 WBTC ~ 10k USDC.
              await reducePoolReserves.call(this, Zero, USDC("1e6"));

              // Set the liquidation incentive to ~0.3%.
              await this.contracts.fintroller
                .connect(this.signers.admin)
                .setLiquidationIncentive(this.contracts.wbtc.address, liquidationIncentive);
            });

            it("flash swaps WBTC", async function () {
              const to: string = this.contracts.flashUniswapV2.address;
              const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
              await this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
              const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
              expect(oldCollateralBalance).to.equal(newCollateralBalance);
            });

            it("emits a FlashSwapAndLiquidateBorrow event", async function () {
              const to: string = this.contracts.flashUniswapV2.address;
              const contractCall = this.contracts.uniswapV2Pair
                .connect(this.signers.liquidator)
                .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
              await expect(contractCall)
                .to.emit(this.contracts.flashUniswapV2, "FlashSwapAndLiquidateBorrow")
                .withArgs(
                  this.signers.liquidator.address,
                  this.signers.borrower.address,
                  this.contracts.hToken.address,
                  swapUnderlyingAmount,
                  seizeCollateralAmount,
                  repayCollateralAmount,
                  Zero,
                  Zero,
                );
            });
          });

          context("when the repay amount is greater than the seized amount", function () {
            const repayCollateralAmount: BigNumber = WBTC("1.01314044");
            const seizeCollateralAmount: BigNumber = WBTC("1");
            const subsidyCollateralAmount: BigNumber = WBTC("0.01314044");

            beforeEach(async function () {
              // Set the WBTC price to $10k to make borrower's collateral ratio 100%.
              await this.contracts.wbtcPriceFeed.setPrice(price("10000"));

              // Burn 1m USDC from the pair contract, which makes the price 1 WBTC ~ 10k USDC.
              await reducePoolReserves.call(this, Zero, USDC("1e6"));

              // Set the liquidation incentive to 0%.
              await this.contracts.fintroller
                .connect(this.signers.admin)
                .setLiquidationIncentive(this.contracts.wbtc.address, LIQUIDATION_INCENTIVES.lowerBound);
            });

            context("when the turnout is not satisfied", function () {
              it("reverts", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const data = getFlashSwapCallData.call(this, subsidyCollateralAmount.sub(1).mul(-1));
                await expect(
                  this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
                ).to.be.revertedWith(FlashUniswapV2Errors.TURNOUT_NOT_SATISFIED);
              });
            });

            context("when the turnout is satisfied", function () {
              let data: string;

              beforeEach(async function () {
                data = getFlashSwapCallData.call(this, subsidyCollateralAmount.mul(-1));
              });

              it("flash swaps WBTC, makes no WBTC profit and subsidizes the flash swap fee", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                await this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
                const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                expect(oldCollateralBalance.sub(newCollateralBalance)).to.equal(subsidyCollateralAmount);
              });

              it("emits a FlashSwapAndLiquidateBorrow event", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const contractCall = this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
                await expect(contractCall)
                  .to.emit(this.contracts.flashUniswapV2, "FlashSwapAndLiquidateBorrow")
                  .withArgs(
                    this.signers.liquidator.address,
                    this.signers.borrower.address,
                    this.contracts.hToken.address,
                    swapUnderlyingAmount,
                    seizeCollateralAmount,
                    repayCollateralAmount,
                    subsidyCollateralAmount,
                    Zero,
                  );
              });
            });
          });

          context("when the repay amount is less than the seized amount", function () {
            const repayCollateralAmount: BigNumber = WBTC("0.80887825");
            const seizeCollateralAmount: BigNumber = WBTC("0.88");

            beforeEach(async function () {
              // Set the WBTC price to $12.5k to make borrower's collateral ratio 125%.
              await this.contracts.wbtcPriceFeed.setPrice(price("12500"));

              // Burn 750k USDC from the pair contract, which makes the price 1 WBTC ~ 12.5k USDC.
              await reducePoolReserves.call(this, Zero, USDC("75e4"));
            });

            context("when the turnout is not satisfied", function () {
              it("reverts", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const data = getFlashSwapCallData.call(this, profitCollateralAmount.add(1));
                await expect(
                  this.contracts.uniswapV2Pair
                    .connect(this.signers.liquidator)
                    .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
                ).to.be.revertedWith(FlashUniswapV2Errors.TURNOUT_NOT_SATISFIED);
              });
            });

            context("when the turnout is satisfied", function () {
              let data: string;

              beforeEach(async function () {
                data = getFlashSwapCallData.call(this);
              });

              it("flash swaps USDC and makes a WBTC profit", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const oldCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                await this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
                const newCollateralBalance = await this.contracts.wbtc.balanceOf(this.signers.liquidator.address);
                expect(newCollateralBalance.sub(profitCollateralAmount)).to.equal(oldCollateralBalance);
              });

              it("emits a FlashSwapAndLiquidateBorrow event", async function () {
                const to: string = this.contracts.flashUniswapV2.address;
                const contractCall = this.contracts.uniswapV2Pair
                  .connect(this.signers.liquidator)
                  .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
                await expect(contractCall)
                  .to.emit(this.contracts.flashUniswapV2, "FlashSwapAndLiquidateBorrow")
                  .withArgs(
                    this.signers.liquidator.address,
                    this.signers.borrower.address,
                    this.contracts.hToken.address,
                    swapUnderlyingAmount,
                    seizeCollateralAmount,
                    repayCollateralAmount,
                    Zero,
                    profitCollateralAmount,
                  );
              });
            });
          });
        });
      });
    });
  });
}
