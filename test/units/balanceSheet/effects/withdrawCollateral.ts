import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeWithdrawCollateral(): void {
  const collateralAmount: BigNumber = TenTokens;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the amount to withdraw is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.stubs.yToken.address).returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, collateralAmount)
            .returns(true);
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, collateralAmount);
        });

        describe("when the caller did not lock the collateral", function () {
          beforeEach(async function () {
            await this.stubs.collateral.mock.transfer.withArgs(this.accounts.brad, collateralAmount).returns(true);
          });

          it("makes the collateral withdrawal", async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.brad)
              .withdrawCollateral(this.stubs.yToken.address, collateralAmount);
          });

          it("emits a WithdrawCollateral event", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
            )
              .to.emit(this.contracts.balanceSheet, "WithdrawCollateral")
              .withArgs(this.stubs.yToken.address, this.accounts.brad, collateralAmount);
          });
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.brad)
              .lockCollateral(this.stubs.yToken.address, collateralAmount);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralInsufficientFreeCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.brad)
              .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
          ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralInsufficientFreeCollateral);
        });
      });
    });

    describe("when the amount to withdraw is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.brad).withdrawCollateral(this.stubs.yToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.brad)
          .withdrawCollateral(this.stubs.yToken.address, collateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });
}
