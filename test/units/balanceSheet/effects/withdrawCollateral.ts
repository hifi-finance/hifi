import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";
import { TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeWithdrawCollateral(): void {
  const collateralAmount: BigNumber = TokenAmounts.Ten;

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.yToken.address);
    });

    describe("when the amount to withdraw is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .withdrawCollateral(this.stubs.yToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralZero);
      });
    });

    describe("when the amount to withdraw is not zero", function () {
      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
          ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralInsufficientFreeCollateral);
        });
      });

      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.yToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.borrower, this.contracts.balanceSheet.address, collateralAmount)
            .returns(true);
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.stubs.yToken.address, collateralAmount);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .lockCollateral(this.stubs.yToken.address, collateralAmount);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralInsufficientFreeCollateral);
          });
        });

        describe("when the caller did not lock the collateral", function () {
          beforeEach(async function () {
            await this.stubs.collateral.mock.transfer.withArgs(this.accounts.borrower, collateralAmount).returns(true);
          });

          it("makes the collateral withdrawal", async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.stubs.yToken.address, collateralAmount);
          });

          it("emits a WithdrawCollateral event", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
            )
              .to.emit(this.contracts.balanceSheet, "WithdrawCollateral")
              .withArgs(this.stubs.yToken.address, this.accounts.borrower, collateralAmount);
          });
        });
      });
    });
  });
}
