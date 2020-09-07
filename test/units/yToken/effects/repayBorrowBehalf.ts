import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetConstants, FintrollerConstants, OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { YTokenErrors } from "../../../helpers/errors";
import { contextForBradDepositingTenTokensAsCollateral } from "../../../helpers/mochaContexts";

/**
 * This test suite assumes that Lucy pays the debt on behalf of Brad.
 */
export default function shouldBehaveLikeRepayBorrowBehalf(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.balanceSheet.mock.getVault
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(...Object.values(BalanceSheetConstants.DefaultOpenVault));
      await this.stubs.balanceSheet.mock.isVaultOpen
        .withArgs(this.contracts.yToken.address, this.accounts.brad)
        .returns(true);
    });

    describe("when the amount to repay is not zero", function () {
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

          contextForBradDepositingTenTokensAsCollateral("when the user has a debt", function () {
            beforeEach(async function () {
              /* Brads borrows 100 yDAI. */
              await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.contracts.yToken.connect(this.signers.brad).borrow(OneHundredTokens);

              /* And sends it all to Lucy. */
              await this.contracts.yToken.connect(this.signers.brad).transfer(this.accounts.lucy, OneHundredTokens);
            });

            it.skip("repays the borrowed yTokens", async function () {
              const preBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              await this.contracts.yToken
                .connect(this.signers.lucy)
                .repayBorrowBehalf(this.accounts.brad, OneHundredTokens);
              const postBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              expect(preBalance).to.equal(postBalance.add(OneHundredTokens));
            });

            it.skip("emits a RepayBorrow event", async function () {
              await expect(
                this.contracts.yToken
                  .connect(this.signers.lucy)
                  .repayBorrowBehalf(this.accounts.brad, OneHundredTokens),
              )
                .to.emit(this.contracts.yToken, "RepayBorrow")
                .withArgs(this.accounts.lucy, this.accounts.brad, OneHundredTokens);
            });

            it.skip("emits a Transfer event", async function () {
              await expect(
                this.contracts.yToken
                  .connect(this.signers.lucy)
                  .repayBorrowBehalf(this.accounts.brad, OneHundredTokens),
              )
                .to.emit(this.contracts.yToken, "Transfer")
                .withArgs(this.accounts.lucy, this.contracts.yToken.address, OneHundredTokens);
            });
          });

          describe("when the user does not have a debt", function () {
            beforeEach(async function () {
              /* Lucy deposits 10 WETH as collateral. */
              await this.stubs.balanceSheet.mock.getVault
                .withArgs(this.contracts.yToken.address, this.accounts.lucy)
                .returns(...Object.values(BalanceSheetConstants.DefaultOpenVault));
              await this.stubs.balanceSheet.mock.isVaultOpen
                .withArgs(this.contracts.yToken.address, this.accounts.lucy)
                .returns(true);
              await this.stubs.fintroller.mock.depositCollateralAllowed
                .withArgs(this.contracts.yToken.address)
                .returns(true);
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.lucy, this.contracts.yToken.address, TenTokens)
                .returns(true);
              await this.contracts.yToken.connect(this.signers.lucy).depositCollateral(TenTokens);
              await this.contracts.yToken.connect(this.signers.lucy).lockCollateral(TenTokens);

              /* Lucy borrows 100 yDAI by minting them. */
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.contracts.yToken.connect(this.signers.lucy).borrow(OneHundredTokens);
            });

            it.skip("reverts", async function () {
              /* Lucy tries to repays Brad's debt but fails to do so because he doesn't have one. */
              await expect(
                this.contracts.yToken
                  .connect(this.signers.lucy)
                  .repayBorrowBehalf(this.accounts.brad, OneHundredTokens),
              ).to.be.revertedWith(YTokenErrors.RepayBorrowInsufficientDebt);
            });
          });
        });

        describe("when the fintroller does not allow repay borrow", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.repayBorrowAllowed.withArgs(this.contracts.yToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).repayBorrowBehalf(this.accounts.brad, OneHundredTokens),
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
    it.skip("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.lucy).repayBorrowBehalf(this.accounts.brad, OneHundredTokens),
      ).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
