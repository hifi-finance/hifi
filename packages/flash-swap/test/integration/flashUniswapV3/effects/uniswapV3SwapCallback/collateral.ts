import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256 } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { FlashUniswapV3Errors } from "@hifi/errors";
import { USDC, WBTC, hUSDC, price } from "@hifi/helpers";
import { expect } from "chai";

import { increaseUniswapV3PoolReserves } from "../../../../shared/helpers";

interface FlashLiquidateParams {
  borrower: string;
  bond: string;
  collateral: string;
  poolFee: number;
  turnout: BigNumber;
  underlyingAmount: BigNumber;
}

async function getFlashLiquidateParams(this: Mocha.Context, collateral: string): Promise<FlashLiquidateParams> {
  const borrower: string = this.signers.borrower.address;
  const bond: string = this.contracts.hToken.address;
  const turnout: BigNumber = WBTC("0.001");
  const underlyingAmount: BigNumber = USDC("10000");

  const params: FlashLiquidateParams = {
    borrower: borrower,
    bond: bond,
    collateral: collateral, // use underlying as collateral
    poolFee: await this.contracts.uniswapV3Pool.connect(this.signers.raider).fee(),
    turnout: turnout,
    underlyingAmount: underlyingAmount,
  };

  return params;
}

export function shouldBehaveLikeCollateralFlashSwap(): void {
  const borrowAmount: BigNumber = hUSDC("10000");
  const collateralCeiling: BigNumber = USDC("1e6");
  const debtCeiling: BigNumber = hUSDC("1e6");
  const depositCollateralAmount: BigNumber = WBTC("1");
  //const profitCollateralAmount: BigNumber = WBTC("0.07112175"); // based on 125% collateralization ratio
  const subsidyCollateralAmount: BigNumber = WBTC("0.01314044");
  //const swapCollateralAmount: BigNumber = Zero;
  //const swapUnderlyingAmount: BigNumber = USDC("10000");

  context("when the underlying is flash borrowed", function () {
    context("when the collateral is the same as the underlying", function () {
      it("reverts", async function () {
        const params: FlashLiquidateParams = await getFlashLiquidateParams.call(this, this.contracts.usdc.address);
        await expect(
          this.contracts.flashUniswapV3.connect(this.signers.raider).flashLiquidate(params),
        ).to.be.revertedWith(FlashUniswapV3Errors.LIQUIDATE_UNDERLYING_BACKED_VAULT);
      });
    });

    beforeEach(async function () {
      // Set the oracle price to 1 WBTC = $20k.
      await this.contracts.wbtcPriceFeed.setPrice(price("20000"));

      // Set the oracle price to 1 USDC = $1.
      await this.contracts.usdcPriceFeed.setPrice(price("1"));

      //Set up the uniswapV3 Pool,  mint a position.
      await increaseUniswapV3PoolReserves.call(this, "120000000000000");

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
        .approve(this.contracts.flashUniswapV3.address, MaxUint256);

      // Deposit the WBTC in the BalanceSheet.
      await this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .depositCollateral(this.contracts.wbtc.address, depositCollateralAmount);

      // Borrow hUSDC.
      await this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .borrow(this.contracts.hToken.address, borrowAmount);
    });

    context("when the collateral is not the same as the underlying", function () {
      beforeEach(async function () {
        await this.contracts.wbtcPriceFeed.setPrice(price("13156"));
      });

      context("when the bond does not have enough allowance to spend underlying from flash swap contract", function () {
        beforeEach(async function () {
          // Set bond's allowance of the flash swap contract's underlying to 0.
          await this.contracts.usdc.__godMode_approve(
            this.contracts.flashUniswapV3.address,
            this.contracts.hToken.address,
            "0",
          );
        });

        context("when the flash borrow and swap are on the same pool", function () {
          it("revert", async function () {
            const params: FlashLiquidateParams = await getFlashLiquidateParams.call(this, this.contracts.wbtc.address);
            await expect(
              this.contracts.flashUniswapV3.connect(this.signers.liquidator).flashLiquidate(params),
            ).to.be.revertedWith("LOK");
          });
        });
      });
    });
  });
}
