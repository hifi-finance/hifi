import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { WBTC, hUSDC } from "../../../../helpers/numbers";

export default function shouldBehaveLikeRepayBorrow(): void {
  const debtCeiling: BigNumber = hUSDC("1e6");
  const borrowAmount: BigNumber = hUSDC("15000");
  const wbtcDepositAmount: BigNumber = WBTC("1");

  beforeEach(async function () {
    // List the collateral in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hTokens[0].address);

    // Allow borrows and borrow repays.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBorrowAllowed(this.contracts.hTokens[0].address, true);
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setRepayBorrowAllowed(this.contracts.hTokens[0].address, true);

    // Set the debt ceiling.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setDebtCeiling(this.contracts.hTokens[0].address, debtCeiling);

    // Mint 1 WBTC and approve the BalanceSheet to spend it.
    await this.contracts.wbtc.mint(this.signers.borrower.address, wbtcDepositAmount);
    await this.contracts.wbtc
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, wbtcDepositAmount);

    // Deposit the 1 WBTC in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.wbtc.address, wbtcDepositAmount);

    // Make the borrow.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .borrow(this.contracts.hTokens[0].address, borrowAmount);
  });

  it("makes the borrow repay", async function () {
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .repayBorrow(this.contracts.hTokens[0].address, borrowAmount);

    const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
    expect(bondList).to.be.empty;

    const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
      this.signers.borrower.address,
      this.contracts.hTokens[0].address,
    );
    expect(debtAmount).to.equal(Zero);

    const hTokenBalance: BigNumber = await this.contracts.hTokens[0].balanceOf(this.signers.borrower.address);
    expect(hTokenBalance).to.equal(Zero);
  });

  it("emits a Burn event", async function () {
    await expect(
      this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .repayBorrow(this.contracts.hTokens[0].address, borrowAmount),
    )
      .to.emit(this.contracts.hTokens[0], "Burn")
      .withArgs(this.signers.borrower.address, borrowAmount);
  });

  it("emits a Transfer event", async function () {
    await expect(
      this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .repayBorrow(this.contracts.hTokens[0].address, borrowAmount),
    )
      .to.emit(this.contracts.hTokens[0], "Transfer")
      .withArgs(this.signers.borrower.address, this.contracts.hTokens[0].address, borrowAmount);
  });
}
