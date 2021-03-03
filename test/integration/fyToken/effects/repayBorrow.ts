import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const collateralAmount: BigNumber = tokenAmounts.ten;
  const repayAmount: BigNumber = tokenAmounts.forty;
  const newBorrowAmount = borrowAmount.sub(repayAmount);

  beforeEach(async function () {
    /* Open the vault. */
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.fyToken.address);

    /* List the bond in the Fintroller. */
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.fyToken.address);

    /* Allow repay borrow. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.fyToken.address, true);

    /* Set the debt ceiling to 1,000 fyUSDC. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBondDebtCeiling(this.contracts.fyToken.address, tokenAmounts.oneHundredThousand);

    /* Mint 10 WETH and approve the Balance Sheet to spend it all. */
    await this.contracts.collateral.mint(this.accounts.borrower, collateralAmount);
    await this.contracts.collateral
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, collateralAmount);

    /* Deposit the 10 WETH in the Balance Sheet. */
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.fyToken.address, collateralAmount);

    /* Lock the 10 WETH in the vault. */
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .lockCollateral(this.contracts.fyToken.address, collateralAmount);

    /* Recall that the default price of 1 WETH is $100, which makes for a 1000% collateralization rate. */
    await this.contracts.fyToken.connect(this.signers.borrower).borrow(borrowAmount);
  });

  it("repays the borrow", async function () {
    const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.borrower);
    await this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount);
    const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.borrower);
    expect(oldBalance).to.equal(newBalance.add(repayAmount));
  });

  it("reduces the debt of the caller", async function () {
    const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.fyToken.address,
      this.accounts.borrower,
    );
    await this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount);
    const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.fyToken.address,
      this.accounts.borrower,
    );
    expect(oldDebt).to.equal(newDebt.add(repayAmount));
  });

  it("emits a SetVaultDebt event", async function () {
    const oldBorrowAmount: BigNumber = borrowAmount;
    await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount))
      .to.emit(this.contracts.balanceSheet, "SetVaultDebt")
      .withArgs(this.contracts.fyToken.address, this.accounts.borrower, oldBorrowAmount, newBorrowAmount);
  });
}
