import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, tokenAmounts } from "../../../../helpers/constants";
import { GenericErrors, HTokenErrors } from "../../../../helpers/errors";
import { GodModeHToken } from "../../../../typechain/GodModeHToken";
import { stubIsVaultOpen } from "../../stubs";

/**
 * This test suite assumes that the lender pays the debt on behalf of the borrower.
 * Also, this is not as comprehensive as repayBorrow.ts, to avoid re-testing the same logic.
 */
export default function shouldBehaveLikeRepayBorrowBehalf(): void {
  const borrowAmount: BigNumber = tokenAmounts.oneHundred;
  const repayAmount: BigNumber = tokenAmounts.forty;

  context("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.hToken
          .connect(this.signers.lender)
          .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.hToken.address, this.signers.borrower.address);
    });

    context("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.hToken.connect(this.signers.borrower).repayBorrowBehalf(this.signers.borrower.address, Zero),
        ).to.be.revertedWith(HTokenErrors.RepayBorrowZero);
      });
    });

    context("when the amount to repay is not zero", function () {
      context("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.contracts.hToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
        });

        context("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.hToken.address)
              .returns(true);
          });

          context("when the user does not have a debt", function () {
            beforeEach(async function () {
              // The hToken makes an internal call to this stubbed function.
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                .returns(Zero);
            });

            it("reverts", async function () {
              // Lender tries to repays borrower's debt but fails to do it because he doesn't have any.
              await expect(
                this.contracts.hToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              ).to.be.revertedWith(HTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          context("when the user has a debt", function () {
            beforeEach(async function () {
              await (this.contracts.hToken as GodModeHToken).__godMode_mint(this.signers.lender.address, borrowAmount);

              // The hToken makes internal calls to these stubbed functions.
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                .returns(repayAmount);
              await this.stubs.balanceSheet.mock.decreaseVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.borrower.address, repayAmount)
                .returns();
            });

            it("repays the borrowed hTokens", async function () {
              const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.lender.address);
              await this.contracts.hToken
                .connect(this.signers.lender)
                .repayBorrowBehalf(this.signers.borrower.address, repayAmount);
              const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.lender.address);
              expect(oldBalance).to.equal(newBalance.add(repayAmount));
            });

            it("emits a Burn event", async function () {
              await expect(
                this.contracts.hToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.hToken, "Burn")
                .withArgs(this.signers.lender.address, repayAmount);
            });

            it("emits a Transfer event", async function () {
              await expect(
                this.contracts.hToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.hToken, "Transfer")
                .withArgs(this.signers.lender.address, this.contracts.hToken.address, repayAmount);
            });

            it("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.hToken
                  .connect(this.signers.lender)
                  .repayBorrowBehalf(this.signers.borrower.address, repayAmount),
              )
                .to.emit(this.contracts.hToken, "RepayBorrow")
                .withArgs(this.signers.lender.address, this.signers.borrower.address, repayAmount, Zero);
            });
          });
        });
      });
    });
  });
}
