import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const collateralAmount: BigNumber = TokenAmounts.Ten;

  beforeEach(async function () {
    /* Open the vault. */
    await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.contracts.yToken.address);

    /* List the bond in the Fintroller. */
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);

    /* Allow borrow. */
    await this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.contracts.yToken.address, true);

    /* Set the debt ceiling to 1,000 yDAI. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setDebtCeiling(this.contracts.yToken.address, TokenAmounts.OneHundredThousand);

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
  });

  it("borrows yTokens", async function () {
    const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.borrower);
    await this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount);
    const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.borrower);
    expect(oldBalance).to.equal(newBalance.sub(borrowAmount));
  });

  it("increases the debt of the caller", async function () {
    const oldDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.yToken.address,
      this.accounts.borrower,
    );
    await this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount);
    const newDebt: BigNumber = await this.contracts.balanceSheet.getVaultDebt(
      this.contracts.yToken.address,
      this.accounts.borrower,
    );
    expect(oldDebt).to.equal(newDebt.sub(borrowAmount));
  });

  it("emits a SetVaultDebt event", async function () {
    await expect(this.contracts.yToken.connect(this.signers.borrower).borrow(borrowAmount))
      .to.emit(this.contracts.balanceSheet, "SetVaultDebt")
      .withArgs(this.contracts.yToken.address, this.accounts.borrower, Zero, borrowAmount);
  });
}
