import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  const borrowAmount: BigNumber = fp("100");
  const collateralAmount: BigNumber = fp("10");
  const repayAmount: BigNumber = fp("40");
  const newBorrowAmount = borrowAmount.sub(repayAmount);

  beforeEach(async function () {
    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

    // Open the vault.
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.hToken.address);

    // Allow repay borrow.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.hToken.address, true);

    // Set the debt ceiling to 100k fyUSDC.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBondDebtCeiling(this.contracts.hToken.address, fp("1e6"));

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

    // Recall that the default price of 1 WETH is $100, which makes for a 1000% collateralization rate.
    await this.contracts.hToken.connect(this.signers.borrower).borrow(borrowAmount);
  });

  it("repays the borrow", async function () {
    const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
    await this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount);
    const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
    expect(oldBalance).to.equal(newBalance.add(repayAmount));
  });

  it("reduces the debt of the caller", async function () {
    const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.hToken.address,
      this.signers.borrower.address,
    );
    await this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount);
    const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.hToken.address,
      this.signers.borrower.address,
    );
    expect(oldDebt).to.equal(newDebt.add(repayAmount));
  });

  it("emits a DecreaseVaultDebt event", async function () {
    const oldBorrowAmount: BigNumber = borrowAmount;
    await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount))
      .to.emit(this.contracts.balanceSheet, "DecreaseVaultDebt")
      .withArgs(this.contracts.hToken.address, this.signers.borrower.address, oldBorrowAmount, newBorrowAmount);
  });
}
