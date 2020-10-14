import { Zero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { AddressOne, TokenAmounts } from "../../../utils/constants";
import { GenericErrors, YTokenErrors } from "../../../utils/errors";
import { FintrollerErrors } from "../../../utils/errors";
import { stubGetBondCollateralizationRatio, stubIsVaultOpen } from "../../stubs";

export default function shouldBehaveLikeRepayBorrow(): void {
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

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              /* Brad borrows 100 yDAI. */
              await this.contracts.yToken.__godMode_mint(this.accounts.brad, borrowAmount);
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad)
                .returns(repayAmount);

              /* The yToken makes an internal call to this stubbed function. */
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad, Zero)
                .returns(true);
            });

            describe("when the caller has enough yTokens", function () {
              it("repays the borrowed yTokens", async function () {
                const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
                await this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount);
                const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
                expect(oldBalance).to.equal(newBalance.add(repayAmount));
              });

              it("emits a RepayBorrow event", async function () {
                await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount))
                  .to.emit(this.contracts.yToken, "RepayBorrow")
                  .withArgs(this.accounts.brad, this.accounts.brad, repayAmount, Zero);
              });

              it("emits a Burn event", async function () {
                await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount))
                  .to.emit(this.contracts.yToken, "Burn")
                  .withArgs(this.accounts.brad, repayAmount);
              });

              it("emits a Transfer event", async function () {
                await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount))
                  .to.emit(this.contracts.yToken, "Transfer")
                  .withArgs(this.accounts.brad, this.contracts.yToken.address, repayAmount);
              });
            });

            describe("when the caller does not have enough yTokens", function () {
              beforeEach(async function () {
                /* Brad burns all of his yTokens. */
                await this.contracts.yToken.connect(this.signers.brad).transfer(AddressOne, repayAmount);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount),
                ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientBalance);
              });
            });
          });

          describe("when the caller does not have a debt", function () {
            beforeEach(async function () {
              await stubIsVaultOpen.call(this, this.contracts.yToken.address, this.accounts.lucy);
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.lucy)
                .returns(Zero);
              await this.contracts.yToken.__godMode_mint(this.accounts.lucy, repayAmount);
            });

            it("reverts", async function () {
              /* Lucy tries to repay her debt but fails to do it because she doesn't have any. */
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrow(repayAmount),
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
            await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount)).to.be.revertedWith(
              YTokenErrors.RepayBorrowNotAllowed,
            );
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getRepayBorrowAllowed
            .withArgs(this.contracts.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount)).to.be.revertedWith(
            FintrollerErrors.BondNotListed,
          );
        });
      });
    });

    describe("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(Zero)).to.be.revertedWith(
          YTokenErrors.RepayBorrowZero,
        );
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
      await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(repayAmount)).to.be.revertedWith(
        GenericErrors.VaultNotOpen,
      );
    });
  });
}
