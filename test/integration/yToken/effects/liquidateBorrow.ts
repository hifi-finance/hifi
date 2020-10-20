import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { Percentages, Prices, TokenAmounts } from "../../../../helpers/constants";
import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const collateralAmount: BigNumber = TokenAmounts.Ten;
  const repayAmount: BigNumber = TokenAmounts.Fifty;

  let clutchableCollateralAmount: BigNumber;

  beforeEach(async function () {
    /* Open the vault. */
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.yToken.address);

    /* List the bond in the Fintroller. */
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);

    /* Allow liquidate borrow. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setLiquidateBorrowAllowed(this.contracts.yToken.address, true);

    /* Allow repay borrow. */
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
    await this.contracts.collateral.mint(this.accounts.borrower, collateralAmount);
    await this.contracts.collateral
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, collateralAmount);

    /* Deposit the 10 WETH in the Balance Sheet. */
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.yToken.address, collateralAmount);

    /* Lock the 10 WETH in the vault. */
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .lockCollateral(this.contracts.yToken.address, collateralAmount);

    /* Recall that the default price of 1 WETH is $100, which makes for a 1000% collateralization rate. */
    await this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount);

    /* Set the price of 1 WETH to $12 so that the new collateralization ratio becomes 120%. */
    await this.contracts.oracle.setWethPrice(Prices.TwelveDollars);

    /* Mint 100 yDAI to Liquidator so he can repay the debt. */
    await this.contracts.yToken.__godMode_mint(this.accounts.liquidator, repayAmount);

    /* Calculate the amount of clutchable collateral. */
    clutchableCollateralAmount = await this.contracts.balanceSheet.getClutchableCollateral(
      this.contracts.yToken.address,
      repayAmount,
    );
  });

  /**
   * This happens when the price of the collateral fell so rapidly that there
   * isn't enough (in dollar terms) to compensate the liquidator.
   */
  describe("when there is not enough locked collateral", function () {
    beforeEach(async function () {
      /* Set the price of 1 WETH to $1 so that the new collateralization ratio becomes 10%. */
      await this.contracts.oracle.setWethPrice(Prices.OneDollar);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount),
      ).to.be.revertedWith(BalanceSheetErrors.InsufficientLockedCollateral);
    });
  });

  describe("when there is enough locked collateral", function () {
    it("liquidates the borrower", async function () {
      const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
      await this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount);
      const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.liquidator);
      expect(oldBalance).to.equal(newBalance.add(repayAmount));
    });

    it("reduces the debt of the borrower", async function () {
      const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.contracts.yToken.address,
        this.accounts.borrower,
      );
      await this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount);
      const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.contracts.yToken.address,
        this.accounts.borrower,
      );
      expect(oldDebt).to.equal(newDebt.add(repayAmount));
    });

    it("reduces the locked collateral of the borrower", async function () {
      const oldLockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.contracts.yToken.address,
        this.accounts.borrower,
      );
      await this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount);
      const newLockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.contracts.yToken.address,
        this.accounts.borrower,
      );
      expect(oldLockedCollateral).to.equal(newLockedCollateral.add(clutchableCollateralAmount));
    });

    it("transfers the clutched collateral to the liquidator", async function () {
      const oldBalance: BigNumber = await this.contracts.collateral.balanceOf(this.accounts.liquidator);
      await this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount);
      const newBalance: BigNumber = await this.contracts.collateral.balanceOf(this.accounts.liquidator);
      expect(oldBalance).to.equal(newBalance.sub(clutchableCollateralAmount));
    });

    it("emits a ClutchCollateral event", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.liquidator).liquidateBorrow(this.accounts.borrower, repayAmount),
      )
        .to.emit(this.contracts.balanceSheet, "ClutchCollateral")
        .withArgs(
          this.contracts.yToken.address,
          this.accounts.liquidator,
          this.accounts.borrower,
          clutchableCollateralAmount,
        );
    });
  });
}
