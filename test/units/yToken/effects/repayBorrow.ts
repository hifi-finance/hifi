import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetConstants, FintrollerConstants, OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { FintrollerErrors } from "../../../helpers/errors";
import { YTokenErrors } from "../../../helpers/errors";
import { stubVaultLockedCollateral, stubVaultDebt } from "../../../helpers/stubs";

export default function shouldBehaveLikeRepayBorrow(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.getVault
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(...Object.values(BalanceSheetConstants.DefaultVault));
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(true);
    });

    describe("when the amount to is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.contracts.yToken.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
        });

        describe("when the fintroller allows repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.repayBorrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              /* Brad borrows 100 yDAI. */
              await stubVaultLockedCollateral.call(this, this.contracts.yToken.address, this.accounts.brad, TenTokens);
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad, OneHundredTokens)
                .returns(true);
              await this.contracts.yToken.connect(this.signers.brad).borrow(OneHundredTokens);
              await stubVaultDebt.call(this, this.contracts.yToken.address, this.accounts.brad, OneHundredTokens);

              /* The yToken's makes an internal call to this stubbed function. */
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad, Zero)
                .returns(true);
            });

            it("repays the borrowed yTokens", async function () {
              const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
              await this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens);
              const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
              expect(oldBalance).to.equal(newBalance.add(OneHundredTokens));
            });

            it("emits a RepayBorrow event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens))
                .to.emit(this.contracts.yToken, "RepayBorrow")
                .withArgs(this.accounts.brad, this.accounts.brad, OneHundredTokens);
            });

            it("emits a Transfer event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens))
                .to.emit(this.contracts.yToken, "Transfer")
                .withArgs(this.accounts.brad, this.contracts.yToken.address, OneHundredTokens);
            });
          });

          describe("when the caller does not have a debt", function () {
            beforeEach(async function () {
              /* Brads borrows 100 yDAI. */
              await stubVaultLockedCollateral.call(this, this.contracts.yToken.address, this.accounts.brad, TenTokens);
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.stubs.balanceSheet.mock.setVaultDebt
                .withArgs(this.contracts.yToken.address, this.accounts.brad, OneHundredTokens)
                .returns(true);
              await this.contracts.yToken.connect(this.signers.brad).borrow(OneHundredTokens);
              await stubVaultDebt.call(this, this.contracts.yToken.address, this.accounts.brad, OneHundredTokens);

              /* And sends it all to Lucy. */
              await this.contracts.yToken.connect(this.signers.brad).transfer(this.accounts.lucy, OneHundredTokens);
            });

            it("reverts", async function () {
              /* Lucy tries to repay her debt but fails to do it because she doesn't have one. */
              await this.stubs.balanceSheet.mock.getVault
                .withArgs(this.contracts.yToken.address, this.accounts.lucy)
                .returns(...Object.values(BalanceSheetConstants.DefaultVault));
              await this.stubs.balanceSheet.mock.isVaultOpen
                .withArgs(this.contracts.yToken.address, this.accounts.lucy)
                .returns(true);
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).repayBorrow(OneHundredTokens),
              ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientDebt);
            });
          });

          describe("when the caller does not have any yTokens", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.balanceOf.withArgs(this.accounts.brad).returns(Zero);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens),
              ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientBalance);
            });
          });
        });

        describe("when the fintroller does not allow repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.repayBorrowAllowed.withArgs(this.contracts.yToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens),
            ).to.be.revertedWith(YTokenErrors.RepayBorrowNotAllowed);
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.repayBorrowAllowed
            .withArgs(this.contracts.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
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
      await expect(this.contracts.yToken.connect(this.signers.brad).repayBorrow(OneHundredTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
