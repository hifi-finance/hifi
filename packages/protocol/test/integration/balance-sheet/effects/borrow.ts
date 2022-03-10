import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { WBTC, hUSDC } from "@hifi/helpers";
import { expect } from "chai";

export function shouldBehaveLikeBorrow(): void {
  const borrowAmount: BigNumber = hUSDC("15000");
  const collateralCeiling: BigNumber = WBTC("100");
  const debtCeiling: BigNumber = hUSDC("1e6");
  const wbtcDepositAmount: BigNumber = WBTC("1");

  beforeEach(async function () {
    // List the collateral in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.contracts.wbtc.address);

    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hTokens[0].address);

    // Allow borrows.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setBorrowAllowed(this.contracts.hTokens[0].address, true);

    // Set the collateral ceiling.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setCollateralCeiling(this.contracts.wbtc.address, collateralCeiling);

    // Set the debt ceiling.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setDebtCeiling(this.contracts.hTokens[0].address, debtCeiling);

    // Mint 1 WBTC and approve the BalanceSheet to spend it.
    await this.contracts.wbtc.__godMode_mint(this.signers.borrower.address, wbtcDepositAmount);
    await this.contracts.wbtc
      .connect(this.signers.borrower)
      .approve(this.contracts.balanceSheet.address, wbtcDepositAmount);

    // Deposit the 1 WBTC in the BalanceSheet.
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .depositCollateral(this.contracts.wbtc.address, wbtcDepositAmount);
  });

  it("borrows hTokens", async function () {
    await this.contracts.balanceSheet
      .connect(this.signers.borrower)
      .borrow(this.contracts.hTokens[0].address, borrowAmount);

    const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
    expect(bondList).to.have.same.members([this.contracts.hTokens[0].address]);

    const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
      this.signers.borrower.address,
      this.contracts.hTokens[0].address,
    );
    expect(debtAmount).to.equal(borrowAmount);

    const hTokenBalance: BigNumber = await this.contracts.hTokens[0].balanceOf(this.signers.borrower.address);
    expect(hTokenBalance).to.equal(borrowAmount);
  });

  it("emits a Mint event", async function () {
    await expect(
      this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .borrow(this.contracts.hTokens[0].address, borrowAmount),
    )
      .to.emit(this.contracts.hTokens[0], "Mint")
      .withArgs(this.signers.borrower.address, borrowAmount);
  });

  it("emits a Transfer event", async function () {
    await expect(
      this.contracts.balanceSheet
        .connect(this.signers.borrower)
        .borrow(this.contracts.hTokens[0].address, borrowAmount),
    )
      .to.emit(this.contracts.hTokens[0], "Transfer")
      .withArgs(AddressZero, this.signers.borrower.address, borrowAmount);
  });
}
