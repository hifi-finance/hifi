import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { BalanceSheetErrors } from "@hifi/errors";
import { hUSDC } from "@hifi/helpers";
import { expect } from "chai";

export function shouldBehaveLikeRepayBorrowBehalf(): void {
  const repayAmount: BigNumber = hUSDC("15000");

  beforeEach(async function () {
    await this.mocks.fintroller.mock.getRepayBorrowAllowed.withArgs(this.mocks.hTokens[0].address).returns(true);
  });

  context("when the borrower does not owe a debt", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.maker)
          .repayBorrowBehalf(this.signers.borrower.address, this.mocks.hTokens[0].address, repayAmount),
      ).to.be.revertedWith(BalanceSheetErrors.REPAY_BORROW_INSUFFICIENT_DEBT);
    });
  });

  context("when the borrower owes a debt", function () {
    const debtAmount: BigNumber = repayAmount;

    beforeEach(async function () {
      await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
        this.mocks.hTokens[0].address,
      ]);
      await this.contracts.balanceSheet.__godMode_setDebtAmount(
        this.signers.borrower.address,
        this.mocks.hTokens[0].address,
        debtAmount,
      );
    });

    context("when the caller does not have enough hTokens", function () {
      beforeEach(async function () {
        const hTokenBalance: BigNumber = Zero;
        await this.mocks.hTokens[0].mock.balanceOf.withArgs(this.signers.maker.address).returns(hTokenBalance);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.maker)
            .repayBorrowBehalf(this.signers.borrower.address, this.mocks.hTokens[0].address, repayAmount),
        ).to.be.revertedWith(BalanceSheetErrors.REPAY_BORROW_INSUFFICIENT_BALANCE);
      });
    });

    context("when the caller has enough hTokens", function () {
      beforeEach(async function () {
        const hTokenBalance: BigNumber = debtAmount;
        await this.mocks.hTokens[0].mock.balanceOf.withArgs(this.signers.maker.address).returns(hTokenBalance);

        const burnAmount: BigNumber = repayAmount;
        await this.mocks.hTokens[0].mock.burn.withArgs(this.signers.maker.address, burnAmount).returns();
      });

      it("makes the borrow repay", async function () {
        await this.contracts.balanceSheet
          .connect(this.signers.maker)
          .repayBorrowBehalf(this.signers.borrower.address, this.mocks.hTokens[0].address, repayAmount);

        const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
        expect(bondList).to.be.empty;

        const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
          this.signers.borrower.address,
          this.mocks.hTokens[0].address,
        );
        expect(debtAmount).to.equal(Zero);
      });

      it("emits a RepayBorrow event", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.maker)
            .repayBorrowBehalf(this.signers.borrower.address, this.mocks.hTokens[0].address, repayAmount),
        )
          .to.emit(this.contracts.balanceSheet, "RepayBorrow")
          .withArgs(
            this.signers.maker.address,
            this.signers.borrower.address,
            this.mocks.hTokens[0].address,
            repayAmount,
            Zero,
          );
      });
    });
  });
}
