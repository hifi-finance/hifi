import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { OpenPriceFeedPrecisionScalar, Percentages, TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  // const clutchedCollateralAmount: BigNumber = TokenAmounts.PointFiftyFive;
  const collateralAmount: BigNumber = TokenAmounts.Ten;
  const repayAmount: BigNumber = TokenAmounts.Fifty;

  beforeEach(async function () {
    /* Open the vault. */
    await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.contracts.yToken.address);

    /* List the bond in the Fintroller. */
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);

    /* Allow liquidate borrows on the bond. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setLiquidateBorrowAllowed(this.contracts.yToken.address, true);

    /* Allow repay borrows on the bond. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.yToken.address, true);

    /* Set the debt ceiling to 1,000 yDAI. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setDebtCeiling(this.contracts.yToken.address, TokenAmounts.OneHundredThousand);

    /* Set the liquidation incentive to 110%. */
    await this.contracts.fintroller.connect(this.signers.admin).setLiquidationIncentive(Percentages.OneHundredAndTen);

    /* Mint 10 WETH and approve the Balance Sheet to spend it all. */
    await this.contracts.collateral.mint(this.accounts.brad, collateralAmount);
    await this.contracts.collateral
      .connect(this.signers.brad)
      .approve(this.contracts.balanceSheet.address, collateralAmount);

    /* Deposit the 10 WETH in the Balance Sheet. */
    await this.contracts.balanceSheet
      .connect(this.signers.brad)
      .depositCollateral(this.contracts.yToken.address, collateralAmount);

    /* Lock the 10 WETH in the vault. */
    await this.contracts.balanceSheet
      .connect(this.signers.brad)
      .lockCollateral(this.contracts.yToken.address, collateralAmount);

    /* Recall that the default price of 1 WETH is $100, which makes for a 1000% collateralization rate. */
    await this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount);

    /* Set the price of 1 WETH to $12 so that the new collateralization ratio becomes 120%. */
    const twelveDollars: BigNumber = BigNumber.from(12).mul(OpenPriceFeedPrecisionScalar);
    await this.contracts.oracle.setWethPrice(twelveDollars);

    /* Mint 100 yDAI to Grace so she can repay the debt. */
    await this.contracts.yToken.__godMode_mint(this.accounts.grace, repayAmount);
  });

  it("liquidates the user", async function () {
    const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.grace);
    await this.contracts.yToken.connect(this.signers.grace).liquidateBorrow(this.accounts.brad, repayAmount);
    const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.grace);
    expect(oldBalance).to.equal(newBalance.add(repayAmount));
  });

  it("clutches the collateral", async function () {
    const oldBalance: BigNumber = await this.contracts.collateral.balanceOf(this.accounts.grace);
    const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
      this.contracts.yToken.address,
      repayAmount,
    );
    await this.contracts.yToken.connect(this.signers.grace).liquidateBorrow(this.accounts.brad, repayAmount);
    const newBalance: BigNumber = await this.contracts.collateral.balanceOf(this.accounts.grace);
    expect(oldBalance).to.equal(newBalance.sub(clutchableCollateralAmount));
  });

  it("emits a ClutchCollateral event", async function () {
    const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
      this.contracts.yToken.address,
      repayAmount,
    );
    await expect(this.contracts.yToken.connect(this.signers.grace).liquidateBorrow(this.accounts.brad, repayAmount))
      .to.emit(this.contracts.balanceSheet, "ClutchCollateral")
      .withArgs(this.contracts.yToken.address, this.accounts.grace, this.accounts.brad, clutchableCollateralAmount);
  });
}
