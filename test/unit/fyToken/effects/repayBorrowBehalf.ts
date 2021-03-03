import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, tokenAmounts } from "../../../../helpers/constants";
import { FyTokenErrors, GenericErrors } from "../../../../helpers/errors";
import { stubIsVaultOpen } from "../../stubs";

/**
 * This test suite assumes that the lender pays the debt on behalf of the borrower.
 * Also, this is not as comprehensive as repayBorrow.ts, to avoid re-testing the same logic.
 */
export default function shouldBehaveLikeRepayBorrowBehalf(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const repayAmount: BigNumber = tokenAmounts.forty;

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.fyToken
          .connect(this.signers.lender)
          .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.fyToken.address, this.signers.borrower.address);
    });

    describe("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fyToken.connect(this.signers.borrower).repayBorrowBehalf(this.signers.borrower.address, Zero),
        ).to.be.revertedWith(FyTokenErrors.RepayBorrowZero);
      });
    });

    describe("when the amount to repay is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.contracts.fyToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
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
                .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                .returns(Zero);
            });

            it("reverts", async function () {
              /* Lender tries to repays borrower's debt but fails to do it because he doesn't have any. */
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              ).to.be.revertedWith(FyTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          describe("when the user has a debt", function () {
            beforeEach(async function () {
              await this.contracts.fyToken.__godMode_mint(this.signers.lender.address, borrowAmount);

              /* The fyToken makes internal calls to these stubbed functions. */
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.fyToken.address, this.signers.borrower.address)
                .returns(repayAmount);
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.fyToken.address, this.signers.borrower.address, Zero)
                .returns(true);
            });

            it("repays the borrowed fyTokens", async function () {
              const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.lender.address);
              await this.contracts.fyToken
                .connect(this.signers.lender)
                .repayBorrowBehalf(this.signers.borrower.address, repayAmount);
              const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.lender.address);
              expect(oldBalance).to.equal(newBalance.add(repayAmount));
            });

            it("emits a Burn event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "Burn")
                .withArgs(this.signers.lender.address, repayAmount);
            });

            it("emits a Transfer event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "Transfer")
                .withArgs(this.signers.lender.address, this.contracts.fyToken.address, repayAmount);
            });

            it("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.fyToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.fyToken, "RepayBorrow")
                .withArgs(this.signers.lender.address, this.signers.borrower.address, repayAmount, Zero);
            });
          });
        });
      });
    });
  });
}
