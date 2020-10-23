import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants, TokenAmounts } from "../../../../helpers/constants";
import { FyTokenErrors, GenericErrors } from "../../../../helpers/errors";
import { stubIsVaultOpen } from "../../../stubs";

/**
 * This test suite assumes that the Lender pays the debt on behalf of the Borrower.
 * Also, this is not as comprehensive as repayBorrow.ts, to avoid re-testing the same logic.
 */
export default function shouldBehaveLikeRepayBorrowBehalf(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const repayAmount: BigNumber = TokenAmounts.Forty;

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.fyToken.address, this.accounts.borrower)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.fyToken.connect(this.signers.lender).repayBorrowBehalf(this.accounts.borrower, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.fyToken.address, this.accounts.borrower);
    });

    describe("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fyToken.connect(this.signers.borrower).repayBorrowBehalf(this.accounts.borrower, Zero),
        ).to.be.revertedWith(FyTokenErrors.RepayBorrowZero);
      });
    });

    describe("when the amount to repay is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.contracts.fyToken.address)
            .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
        });

        describe("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.fyToken.address)
              .returns(true);
          });

          describe("when the user does not have a debt", function () {
            beforeEach(async function () {
              /* The fyToken makes an internal call to this stubbed function. */
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.borrower)
                .returns(Zero);
            });

            it("reverts", async function () {
              /* Lender tries to repays Borrower's debt but fails to do it because he doesn't have any. */
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.accounts.borrower, repayAmount),
              ).to.be.revertedWith(FyTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          describe("when the user has a debt", function () {
            beforeEach(async function () {
              await this.contracts.fyToken.__godMode_mint(this.accounts.lender, borrowAmount);

              /* The fyToken makes internal calls to these stubbed functions. */
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.borrower)
                .returns(repayAmount);
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.borrower, Zero)
                .returns(true);
            });

            it("repays the borrowed fyTokens", async function () {
              const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.lender);
              await this.contracts.fyToken
                .connect(this.signers.lender)
                .repayBorrowBehalf(this.accounts.borrower, repayAmount);
              const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.lender);
              expect(oldBalance).to.equal(newBalance.add(repayAmount));
            });

            it("emits a Burn event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.accounts.borrower, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "Burn")
                .withArgs(this.accounts.lender, repayAmount);
            });

            it("emits a Transfer event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.accounts.borrower, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "Transfer")
                .withArgs(this.accounts.lender, this.contracts.fyToken.address, repayAmount);
            });

            it("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.accounts.borrower, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "RepayBorrow")
                .withArgs(this.accounts.lender, this.accounts.borrower, repayAmount, Zero);
            });
          });
        });
      });
    });
  });
}
