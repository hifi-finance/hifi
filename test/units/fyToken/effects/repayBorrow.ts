import { Zero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { AddressOne, FintrollerConstants, TokenAmounts } from "../../../../helpers/constants";
import { FyTokenErrors, GenericErrors } from "../../../../helpers/errors";
import { FintrollerErrors } from "../../../../helpers/errors";
import { stubIsVaultOpen } from "../../../stubs";

export default function shouldBehaveLikeRepayBorrow(): void {
  const borrowAmount: BigNumber = TokenAmounts.OneHundred;
  const repayAmount: BigNumber = TokenAmounts.Forty;

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.fyToken.address, this.accounts.borrower)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount)).to.be.revertedWith(
        GenericErrors.VaultNotOpen,
      );
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.fyToken.address, this.accounts.borrower);
    });

    describe("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(Zero)).to.be.revertedWith(
          FyTokenErrors.RepayBorrowZero,
        );
      });
    });

    describe("when the amount to repay is not zero", function () {
      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getRepayBorrowAllowed
            .withArgs(this.contracts.fyToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });

      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.contracts.fyToken.address)
            .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
        });

        describe("when the fintroller does not allow repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.fyToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount),
            ).to.be.revertedWith(FyTokenErrors.RepayBorrowNotAllowed);
          });
        });

        describe("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.fyToken.address)
              .returns(true);
          });

          describe("when the caller does not have a debt", function () {
            beforeEach(async function () {
              await stubIsVaultOpen.call(this, this.contracts.fyToken.address, this.accounts.lender);
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.lender)
                .returns(Zero);
            });

            it("reverts", async function () {
              /* Lender tries to repay his debt but fails to do it because he doesn't have any. */
              await expect(
                this.contracts.fyToken.connect(this.signers.lender).repayBorrow(repayAmount),
              ).to.be.revertedWith(FyTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              /* User borrows 100 yDAI. */
              await this.contracts.fyToken.__godMode_mint(this.accounts.borrower, borrowAmount);
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.borrower)
                .returns(repayAmount);

              /* The fyToken makes an internal call to this stubbed function. */
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.fyToken.address, this.accounts.borrower, Zero)
                .returns(true);
            });

            describe("when the caller does not have enough fyTokens", function () {
              beforeEach(async function () {
                /* User burns all of his fyTokens. */
                await this.contracts.fyToken.connect(this.signers.borrower).transfer(AddressOne, borrowAmount);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount),
                ).to.be.revertedWith(FyTokenErrors.RepayBorrowInsufficientBalance);
              });
            });

            describe("when the caller has enough fyTokens", function () {
              it("repays the borrowed fyTokens", async function () {
                const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.borrower);
                await this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount);
                const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.borrower);
                expect(oldBalance).to.equal(newBalance.add(repayAmount));
              });

              it("emits a Burn event", async function () {
                await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.fyToken, "Burn")
                  .withArgs(this.accounts.borrower, repayAmount);
              });

              it("emits a Transfer event", async function () {
                await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.fyToken, "Transfer")
                  .withArgs(this.accounts.borrower, this.contracts.fyToken.address, repayAmount);
              });

              it("emits a RepayBorrow event", async function () {
                await expect(this.contracts.fyToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.fyToken, "RepayBorrow")
                  .withArgs(this.accounts.borrower, this.accounts.borrower, repayAmount, Zero);
              });
            });
          });
        });
      });
    });
  });
}
