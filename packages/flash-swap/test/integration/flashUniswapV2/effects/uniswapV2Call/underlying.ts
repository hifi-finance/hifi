import { defaultAbiCoder } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { MaxUint256 } from "@ethersproject/constants";
import { COLLATERAL_RATIOS, LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { BalanceSheetErrors, FlashUniswapV2Errors } from "@hifi/errors";
import { USDC, WBTC, getNow, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";

import { increasePoolReserves } from "../../../../shared/helpers";

function getFlashSwapCallData(this: Mocha.Context, turnout: BigNumber): string {
  const types = ["address", "address", "address", "int256"];
  const borrower: string = this.signers.borrower.address;
  const bond: string = this.contracts.hToken.address;
  const collateral: string = this.contracts.usdc.address;
  const values = [borrower, bond, collateral, String(turnout)];
  const data: string = defaultAbiCoder.encode(types, values);
  return data;
}

export function shouldBehaveLikeUnderlyingAsCollateralFlashSwap(): void {
  const borrowAmount: BigNumber = hUSDC("10000");
  const collateralCeiling: BigNumber = USDC("1e6");
  const debtCeiling: BigNumber = hUSDC("1e6");
  const depositUnderlyingAmount: BigNumber = USDC("10000");
  const repayHTokenAmount: BigNumber = hUSDC("10000");
  const repayUnderlyingAmount: BigNumber = USDC("10030.090271");
  const subsidyUnderlyingAmount: BigNumber = USDC("30.090271");
  const swapCollateralAmount: BigNumber = Zero;
  const swapUnderlyingAmount: BigNumber = USDC("10000");

  beforeEach(async function () {
    // Set the oracle price to 1 USDC = $1.
    await this.contracts.usdcPriceFeed.setPrice(price("1"));

    // Mint 100 WBTC and 2m USDC to the pair contract. This makes the price 1 WBTC ~ 20k USDC.
    await increasePoolReserves.call(this, WBTC("100"), USDC("2e6"));

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

    // Mint USDC to the borrower's wallet and approve the BalanceSheet to spend it.
    await this.contracts.usdc.__godMode_mint(this.signers.borrower.address, depositUnderlyingAmount);
    await this.contracts.usdc.connect(this.signers.borrower).approve(this.contracts.balanceSheet.address, MaxUint256);

    // Mint USDC to the liquidator's wallet and approve the flash swap contract to spend it.
    await this.contracts.usdc.__godMode_mint(this.signers.liquidator.address, subsidyUnderlyingAmount);
    await this.contracts.usdc
      .connect(this.signers.liquidator)
      .approve(this.contracts.flashUniswapV2.address, MaxUint256);

    // Deposit USDC in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.usdc.address, depositUnderlyingAmount);

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

      const oneHourAgo: BigNumber = getNow().sub(3600);
      await this.contracts.hToken.connect(this.signers.admin).__godMode_setMaturity(oneHourAgo);
    });

    it("flash swaps USDC, makes no USDC profit and subsidizes the flash swap fee", async function () {
      const to: string = this.contracts.flashUniswapV2.address;
      const oldUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
      const data: string = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.mul(-1));
      await this.contracts.uniswapV2Pair
        .connect(this.signers.liquidator)
        .swap(swapUnderlyingAmount, swapCollateralAmount, to, data);
      const newUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
      expect(oldUnderlyingBalance.sub(newUnderlyingBalance)).to.equal(subsidyUnderlyingAmount);
    });
  });

  context("initial order of tokens in the UniswapV2Pair contract", function () {
    context("when the bond did not mature", function () {
      it("reverts", async function () {
        const to: string = this.contracts.flashUniswapV2.address;
        const data: string = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.mul(-1));
        await expect(
          this.contracts.uniswapV2Pair
            .connect(this.signers.liquidator)
            .swap(swapCollateralAmount, swapUnderlyingAmount, to, data),
        ).to.be.revertedWith(BalanceSheetErrors.NO_LIQUIDITY_SHORTFALL);
      });
    });

    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hToken.connect(this.signers.admin).__godMode_setMaturity(oneHourAgo);
      });

      context("when the repay amount is equal to the seized amount", function () {
        const liquidationIncentive = toBn("1.003009027081243731");

        let data: string;
        let expectedRepayUnderlyingAmount: BigNumber;
        let seizeUnderlyingAmount: BigNumber;

        beforeEach(async function () {
          data = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.mul(-1));

          // Mint 0.3% more USDC.
          const addedUnderlyingAmount: BigNumber = swapUnderlyingAmount;
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
          seizeUnderlyingAmount = await this.contracts.balanceSheet.getSeizableCollateralAmount(
            this.contracts.hToken.address,
            repayHTokenAmount,
            this.contracts.usdc.address,
          );
        });

        it("flash swaps USDC and makes no USDC profit", async function () {
          const to: string = this.contracts.flashUniswapV2.address;
          const oldUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
          await this.contracts.uniswapV2Pair
            .connect(this.signers.liquidator)
            .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
          const newUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
          expect(newUnderlyingBalance).to.equal(oldUnderlyingBalance);
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
              seizeUnderlyingAmount,
              expectedRepayUnderlyingAmount,
              Zero,
              Zero,
            );
        });
      });

      context("when the repay amount is greater than the seized amount", function () {
        const seizeUnderlyingAmount: BigNumber = USDC("10000");

        context("when the turnout is not satisfied", function () {
          it("reverts", async function () {
            const to: string = this.contracts.flashUniswapV2.address;
            const data = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.sub(1).mul(-1));
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
            data = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.mul(-1));
          });

          it("flash swaps USDC, makes no USDC profit and subsidizes the flash swap fee", async function () {
            const to: string = this.contracts.flashUniswapV2.address;
            const oldUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
            await this.contracts.uniswapV2Pair
              .connect(this.signers.liquidator)
              .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
            const newUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
            expect(oldUnderlyingBalance.sub(newUnderlyingBalance)).to.equal(subsidyUnderlyingAmount);
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
                seizeUnderlyingAmount,
                repayUnderlyingAmount,
                subsidyUnderlyingAmount,
                Zero,
              );
          });
        });
      });

      context("when the repay amount is less than the seized amount", function () {
        const profitUnderlyingAmount: BigNumber = USDC("969.909729");
        const seizeUnderlyingAmount: BigNumber = USDC("11000");

        context("when the turnout is not satisfied", function () {
          it("reverts", async function () {
            const to: string = this.contracts.flashUniswapV2.address;
            const data = getFlashSwapCallData.call(this, profitUnderlyingAmount.add(1));
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
            data = getFlashSwapCallData.call(this, subsidyUnderlyingAmount.mul(-1));

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
          });

          it("flash swaps USDC and makes a USDC profit", async function () {
            const to: string = this.contracts.flashUniswapV2.address;
            const oldUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
            await this.contracts.uniswapV2Pair
              .connect(this.signers.liquidator)
              .swap(swapCollateralAmount, swapUnderlyingAmount, to, data);
            const newUnderlyingBalance = await this.contracts.usdc.balanceOf(this.signers.liquidator.address);
            expect(newUnderlyingBalance.sub(profitUnderlyingAmount)).to.equal(oldUnderlyingBalance);
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
                seizeUnderlyingAmount,
                repayUnderlyingAmount,
                Zero,
                profitUnderlyingAmount,
              );
          });
        });
      });
    });
  });
}
