import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";
import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeWithdrawCollateral(): void {
  const collateralAmount: BigNumber = tokenAmounts.ten;

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .withdrawCollateral(this.stubs.hToken.address, collateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    describe("when the amount to withdraw is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .withdrawCollateral(this.stubs.hToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralZero);
      });
    });

    describe("when the amount to withdraw is not zero", function () {
      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.stubs.hToken.address, collateralAmount),
          ).to.be.revertedWith(BalanceSheetErrors.InsufficientFreeCollateral);
        });
      });

      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.hToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, collateralAmount)
            .returns(true);
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.stubs.hToken.address, collateralAmount);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .lockCollateral(this.stubs.hToken.address, collateralAmount);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .withdrawCollateral(this.stubs.hToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.InsufficientFreeCollateral);
          });
        });

        describe("when the caller did not lock the collateral", function () {
          beforeEach(async function () {
            await this.stubs.collateral.mock.transfer
              .withArgs(this.signers.borrower.address, collateralAmount)
              .returns(true);
          });

          it("makes the collateral withdrawal", async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.stubs.hToken.address, collateralAmount);
          });

          it("emits a WithdrawCollateral event", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .withdrawCollateral(this.stubs.hToken.address, collateralAmount),
            )
              .to.emit(this.contracts.balanceSheet, "WithdrawCollateral")
              .withArgs(this.stubs.hToken.address, this.signers.borrower.address, collateralAmount);
          });
        });
      });
    });
  });
}
