import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { GenericErrors, YTokenErrors } from "../../../utils/errors";
import { TokenAmounts } from "../../../utils/constants";
import { stubGetBondCollateralizationRatio, stubIsVaultOpen } from "../../stubs";

/**
 * This test suite assumes that Lucy pays the debt on behalf of Brad.
 */
export default function shouldBehaveLikeRepayBorrowBehalf(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const repayAmount: BigNumber = TokenAmounts.OneHundred;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.yToken.address, this.accounts.brad);
    });

    describe("when the amount to repay is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await stubGetBondCollateralizationRatio.call(this, this.contracts.yToken.address);
        });

        describe("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.yToken.address)
              .returns(true);
          });

          describe("when the user has a debt", function () {
            beforeEach(async function () {
              await this.contracts.yToken.__godMode_mint(this.accounts.lucy, borrowAmount);

              /* The yToken makes internal calls to these stubbed functions. */
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad)
                .returns(repayAmount);
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad, Zero)
                .returns(true);
            });

            it("repays the borrowed yTokens", async function () {
              const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              await this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount);
              const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              expect(oldBalance).to.equal(newBalance.add(repayAmount));
            });

            it("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount),
              )
                .to.emit(this.contracts.yToken, "RepayBorrow")
                .withArgs(this.accounts.lucy, this.accounts.brad, repayAmount, Zero);
            });

            it("emits a Burn event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount),
              )
                .to.emit(this.contracts.yToken, "Burn")
                .withArgs(this.accounts.lucy, repayAmount);
            });

            it("emits a Transfer event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount),
              )
                .to.emit(this.contracts.yToken, "Transfer")
                .withArgs(this.accounts.lucy, this.contracts.yToken.address, repayAmount);
            });
          });

          describe("when the user does not have a debt", function () {
            beforeEach(async function () {
              /* The yToken makes an internal call to this stubbed function. */
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad)
                .returns(Zero);
            });

            it("reverts", async function () {
              /* Lucy tries to repays Brad's debt but fails to do it because he doesn't have any. */
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount),
              ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientDebt);
            });
          });
        });

        describe("when the fintroller does not allow repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.yToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).repayBorrowBehalf(this.accounts.brad, repayAmount),
            ).to.be.revertedWith(YTokenErrors.RepayBorrowNotAllowed);
          });
        });
      });
    });

    describe("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.yToken.connect(this.signers.brad).repayBorrowBehalf(this.accounts.brad, Zero),
        ).to.be.revertedWith(YTokenErrors.RepayBorrowZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, repayAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });
}
