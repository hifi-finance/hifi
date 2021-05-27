import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeBorrow(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const collateralAmount: BigNumber = tokenAmounts.ten;

  beforeEach(async function () {
    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

    // Open the vault.
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.hToken.address);

    // Allow borrow.
    await this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.contracts.hToken.address, true);

    // Set the debt ceiling to 1,000 fyUSDC.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBondDebtCeiling(this.contracts.hToken.address, tokenAmounts.oneHundredThousand);

    // Mint 10 WETH and approve the BalanceSheet to spend it all.
    await this.contracts.collateral.mint(this.signers.borrower.address, collateralAmount);
    await this.contracts.collateral
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, collateralAmount);

    // Deposit the 10 WETH in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.hToken.address, collateralAmount);

    // Lock the 10 WETH in the vault.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .lockCollateral(this.contracts.hToken.address, collateralAmount);
  });

  it("borrows hTokens", async function () {
    const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
    await this.contracts.hToken.connect(this.signers.borrower).borrow(borrowAmount);
    const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
    expect(oldBalance).to.equal(newBalance.sub(borrowAmount));
  });

  it("increases the debt of the caller", async function () {
    const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.hToken.address,
      this.signers.borrower.address,
    );
    await this.contracts.hToken.connect(this.signers.borrower).borrow(borrowAmount);
    const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.hToken.address,
      this.signers.borrower.address,
    );
    expect(oldDebt).to.equal(newDebt.sub(borrowAmount));
  });

  it("emits an IncreaseVaultDebt event", async function () {
    await expect(this.contracts.hToken.connect(this.signers.borrower).borrow(borrowAmount))
      .to.emit(this.contracts.balanceSheet, "IncreaseVaultDebt")
      .withArgs(this.contracts.hToken.address, this.signers.borrower.address, Zero, borrowAmount);
  });
}
