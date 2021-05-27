import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { ADDRESS_ONE, FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO } from "../../../../helpers/constants";
import { GenericErrors, HTokenErrors } from "../../../../helpers/errors";
import { GodModeHToken } from "../../../../typechain";
import { stubIsVaultOpen } from "../../stubs";

export default function shouldBehaveLikeRepayBorrow(): void {
  const borrowAmount: BigNumber = fp("100");
  const repayAmount: BigNumber = fp("40");

  context("when the vault is not open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
        .returns(false);
    });

    it("reverts", async function () {
      await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount)).to.be.revertedWith(
        GenericErrors.VaultNotOpen,
      );
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await stubIsVaultOpen.call(this, this.contracts.hToken.address, this.signers.borrower.address);
    });

    context("when the amount to repay is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(Zero)).to.be.revertedWith(
          HTokenErrors.RepayBorrowZero,
        );
      });
    });

    context("when the amount to repay is not zero", function () {
      context("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getRepayBorrowAllowed
            .withArgs(this.contracts.hToken.address)
            .revertsWithReason(GenericErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount),
          ).to.be.revertedWith(GenericErrors.BondNotListed);
        });
      });

      context("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.contracts.hToken.address)
            .returns(FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO);
        });

        context("when the fintroller does not allow repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.hToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount),
            ).to.be.revertedWith(HTokenErrors.RepayBorrowNotAllowed);
          });
        });

        context("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRepayBorrowAllowed
              .withArgs(this.contracts.hToken.address)
              .returns(true);
          });

          context("when the caller does not have a debt", function () {
            beforeEach(async function () {
              await stubIsVaultOpen.call(this, this.contracts.hToken.address, this.signers.lender.address);
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.lender.address)
                .returns(Zero);
            });

            it("reverts", async function () {
              // Lender tries to repay his debt but fails to do it because he doesn't have any.
              await expect(
                this.contracts.hToken.connect(this.signers.lender).repayBorrow(repayAmount),
              ).to.be.revertedWith(HTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          context("when the caller has a debt", function () {
            beforeEach(async function () {
              // User borrows 100 fyUSDC.
              await (this.contracts.hToken as GodModeHToken).__godMode_mint(
                this.signers.borrower.address,
                borrowAmount,
              );
              await this.stubs.balanceSheet.mock.getVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.borrower.address)
                .returns(repayAmount);

              // The hToken makes an internal call to this stubbed function.
              await this.stubs.balanceSheet.mock.decreaseVaultDebt
                .withArgs(this.contracts.hToken.address, this.signers.borrower.address, repayAmount)
                .returns();
            });

            context("when the caller does not have enough hTokens", function () {
              beforeEach(async function () {
                // User burns all of his hTokens.
                await this.contracts.hToken.connect(this.signers.borrower).transfer(ADDRESS_ONE, borrowAmount);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount),
                ).to.be.revertedWith(HTokenErrors.RepayBorrowInsufficientBalance);
              });
            });

            context("when the caller has enough hTokens", function () {
              it("repays the borrowed hTokens", async function () {
                const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
                await this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount);
                const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.borrower.address);
                expect(oldBalance).to.equal(newBalance.add(repayAmount));
              });

              it("emits a Burn event", async function () {
                await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.hToken, "Burn")
                  .withArgs(this.signers.borrower.address, repayAmount);
              });

              it("emits a Transfer event", async function () {
                await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.hToken, "Transfer")
                  .withArgs(this.signers.borrower.address, this.contracts.hToken.address, repayAmount);
              });

              it("emits a RepayBorrow event", async function () {
                await expect(this.contracts.hToken.connect(this.signers.borrower).repayBorrow(repayAmount))
                  .to.emit(this.contracts.hToken, "RepayBorrow")
                  .withArgs(this.signers.borrower.address, this.signers.borrower.address, repayAmount, Zero);
              });
            });
          });
        });
      });
    });
  });
}
