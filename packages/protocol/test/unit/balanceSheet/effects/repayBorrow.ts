import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { hUSDC } from "../../../../helpers/numbers";
import { BalanceSheetErrors } from "../../../shared/errors";

export default function shouldBehaveLikeRepayBorrow(): void {
  context("when the Fintroller does not allow borrow repays", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getRepayBorrowAllowed.withArgs(this.mocks.hTokens[0].address).returns(false);
    });

    it("reverts", async function () {
      const repayAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .repayBorrow(this.mocks.hTokens[0].address, repayAmount),
      ).to.be.revertedWith(BalanceSheetErrors.RepayBorrowNotAllowed);
    });
  });

  context("when the Fintroller allows borrow repays", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getRepayBorrowAllowed.withArgs(this.mocks.hTokens[0].address).returns(true);
    });

    context("when the amount to repay is zero", function () {
      it("reverts", async function () {
        const repayAmount: BigNumber = Zero;
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .repayBorrow(this.mocks.hTokens[0].address, repayAmount),
        ).to.be.revertedWith(BalanceSheetErrors.RepayBorrowZero);
      });
    });

    context("when the amount to repay is not zero", function () {
      const fullRepayAmount: BigNumber = hUSDC("15000");

      context("when the caller did not make a borrow", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .repayBorrow(this.mocks.hTokens[0].address, fullRepayAmount),
          ).to.be.revertedWith(BalanceSheetErrors.RepayBorrowInsufficientDebt);
        });
      });

      context("when the caller made a borrow", function () {
        const borrowAmount: BigNumber = fullRepayAmount;

        beforeEach(async function () {
          await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
            this.mocks.hTokens[0].address,
          ]);
          await this.contracts.balanceSheet.__godMode_setDebtAmount(
            this.signers.borrower.address,
            this.mocks.hTokens[0].address,
            borrowAmount,
          );
        });

        context("when the caller does not have enough hTokens", function () {
          beforeEach(async function () {
            const hTokenBalance: BigNumber = Zero;
            await this.mocks.hTokens[0].mock.balanceOf.withArgs(this.signers.borrower.address).returns(hTokenBalance);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .repayBorrow(this.mocks.hTokens[0].address, fullRepayAmount),
            ).to.be.revertedWith(BalanceSheetErrors.RepayBorrowInsufficientBalance);
          });
        });

        context("when the caller has enough hTokens", function () {
          beforeEach(async function () {
            const hTokenBalance: BigNumber = borrowAmount;
            await this.mocks.hTokens[0].mock.balanceOf.withArgs(this.signers.borrower.address).returns(hTokenBalance);
          });

          context("when the repay is full", function () {
            beforeEach(async function () {
              const burnAmount: BigNumber = fullRepayAmount;
              await this.mocks.hTokens[0].mock.burn.withArgs(this.signers.borrower.address, burnAmount).returns();
            });

            it("makes the borrow repay", async function () {
              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .repayBorrow(this.mocks.hTokens[0].address, fullRepayAmount);

              const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
              expect(bondList).to.be.empty;

              const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
                this.signers.borrower.address,
                this.mocks.hTokens[0].address,
              );
              expect(debtAmount).to.equal(Zero);
            });
          });

          context("when the repay is partial", function () {
            const partialRepayAmount: BigNumber = hUSDC("5000");

            beforeEach(async function () {
              const burnAmount: BigNumber = partialRepayAmount;
              await this.mocks.hTokens[0].mock.burn.withArgs(this.signers.borrower.address, burnAmount).returns();
            });

            it("makes the borrow repay", async function () {
              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .repayBorrow(this.mocks.hTokens[0].address, partialRepayAmount);

              const bondList: string[] = await this.contracts.balanceSheet.getBondList(this.signers.borrower.address);
              expect(bondList).to.have.same.members([this.mocks.hTokens[0].address]);

              const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
                this.signers.borrower.address,
                this.mocks.hTokens[0].address,
              );
              expect(debtAmount).to.equal(borrowAmount.sub(partialRepayAmount));
            });

            it("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .repayBorrow(this.mocks.hTokens[0].address, partialRepayAmount),
              )
                .to.emit(this.contracts.balanceSheet, "RepayBorrow")
                .withArgs(
                  this.signers.borrower.address,
                  this.signers.borrower.address,
                  this.mocks.hTokens[0].address,
                  partialRepayAmount,
                  borrowAmount.sub(partialRepayAmount),
                );
            });
          });
        });
      });
    });
  });
}
