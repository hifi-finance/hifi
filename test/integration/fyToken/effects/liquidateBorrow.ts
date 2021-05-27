import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { percentages, prices, tokenAmounts } from "../../../../helpers/constants";
import { BalanceSheetErrors } from "../../../../helpers/errors";
import { GodModeFyToken } from "../../../../typechain";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const collateralAmount: BigNumber = tokenAmounts.ten;
  const repayAmount: BigNumber = tokenAmounts.fifty;

  let clutchableCollateralAmount: BigNumber;

  beforeEach(async function () {
    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.fyToken.address);

    // Open the vault.
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.fyToken.address);

    // Allow liquidate borrow.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setLiquidateBorrowAllowed(this.contracts.fyToken.address, true);

    // Allow repay borrow.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.fyToken.address, true);

    // Set the debt ceiling to 1,000 fyUSDC.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBondDebtCeiling(this.contracts.fyToken.address, tokenAmounts.oneHundredThousand);

    // Set the liquidation incentive to 110%.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBondLiquidationIncentive(this.contracts.fyToken.address, percentages.oneHundredAndTen);

    // Mint 10 WETH and approve the BalanceSheet to spend it all.
    await this.contracts.collateral.mint(this.signers.borrower.address, collateralAmount);
    await this.contracts.collateral
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, collateralAmount);

    // Deposit the 10 WETH in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.fyToken.address, collateralAmount);

    // Lock the 10 WETH in the vault.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .lockCollateral(this.contracts.fyToken.address, collateralAmount);

    // Recall that the default price of 1 WETH is $100, which makes for a 1000% collateralization rate.
    await this.contracts.fyToken.connect(this.signers.borrower).borrow(borrowAmount);

    // Set the price of 1 WETH to $12 so that the new collateralization ratio becomes 120%.
    await this.contracts.collateralPriceFeed.setPrice(prices.twelveDollars);

    // Mint 100 fyUSDC to the liquidator so he can repay the debt.
    await (this.contracts.fyToken as GodModeFyToken).__godMode_mint(this.signers.liquidator.address, repayAmount);

    // Calculate the amount of clutchable collateral.
    clutchableCollateralAmount = await this.contracts.balanceSheet.getClutchableCollateral(
      this.contracts.fyToken.address,
      repayAmount,
    );
  });

  /// This happens when the price of the collateral fell so rapidly that there
  /// isn't enough (in dollar terms) to compensate the liquidator.
  describe("when there is not enough locked collateral", function () {
    beforeEach(async function () {
      // Set the price of 1 WETH = $1 so that the new collateralization ratio becomes 10%.
      await this.contracts.collateralPriceFeed.setPrice(prices.oneDollar);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.fyToken
          .connect(this.signers.liquidator)
          .liquidateBorrow(this.signers.borrower.address, repayAmount),
      ).to.be.revertedWith(BalanceSheetErrors.InsufficientLockedCollateral);
    });
  });

  describe("when there is enough locked collateral", function () {
    it("liquidates the borrower", async function () {
      const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.liquidator.address);
      await this.contracts.fyToken
        .connect(this.signers.liquidator)
        .liquidateBorrow(this.signers.borrower.address, repayAmount);
      const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.liquidator.address);
      expect(oldBalance).to.equal(newBalance.add(repayAmount));
    });

    it("reduces the debt of the borrower", async function () {
      const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.contracts.fyToken.address,
        this.signers.borrower.address,
      );
      await this.contracts.fyToken
        .connect(this.signers.liquidator)
        .liquidateBorrow(this.signers.borrower.address, repayAmount);
      const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
        this.contracts.fyToken.address,
        this.signers.borrower.address,
      );
      expect(oldDebt).to.equal(newDebt.add(repayAmount));
    });

    it("reduces the locked collateral of the borrower", async function () {
      const oldLockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.contracts.fyToken.address,
        this.signers.borrower.address,
      );
      await this.contracts.fyToken
        .connect(this.signers.liquidator)
        .liquidateBorrow(this.signers.borrower.address, repayAmount);
      const newLockedCollateral: BigNumber = await this.contracts.balanceSheet.getVaultLockedCollateral(
        this.contracts.fyToken.address,
        this.signers.borrower.address,
      );
      expect(oldLockedCollateral).to.equal(newLockedCollateral.add(clutchableCollateralAmount));
    });

    it("transfers the clutched collateral to the liquidator", async function () {
      const oldBalance: BigNumber = await this.contracts.collateral.balanceOf(this.signers.liquidator.address);
      await this.contracts.fyToken
        .connect(this.signers.liquidator)
        .liquidateBorrow(this.signers.borrower.address, repayAmount);
      const newBalance: BigNumber = await this.contracts.collateral.balanceOf(this.signers.liquidator.address);
      expect(oldBalance).to.equal(newBalance.sub(clutchableCollateralAmount));
    });

    it("emits a ClutchCollateral event", async function () {
      await expect(
        this.contracts.fyToken
          .connect(this.signers.liquidator)
          .liquidateBorrow(this.signers.borrower.address, repayAmount),
      )
        .to.emit(this.contracts.balanceSheet, "ClutchCollateral")
        .withArgs(
          this.contracts.fyToken.address,
          this.signers.liquidator.address,
          this.signers.borrower.address,
          clutchableCollateralAmount,
        );
    });
  });
}
