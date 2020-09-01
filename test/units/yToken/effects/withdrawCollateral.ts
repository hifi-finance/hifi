import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { YTokenErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikewithdrawCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the amount to withdraw is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.depositCollateralAllowed
            .withArgs(this.contracts.yToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
            .returns(true);
          await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
        });

        describe("when the caller did not lock the collateral", function () {
          beforeEach(async function () {
            await this.stubs.collateral.mock.transfer.withArgs(this.accounts.brad, TenTokens).returns(true);
          });

          it("makes the collateral withdrawal", async function () {
            await this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(TenTokens);
          });

          it("emits a WithdrawCollateral event", async function () {
            await expect(this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(TenTokens))
              .to.emit(this.contracts.yToken, "WithdrawCollateral")
              .withArgs(this.accounts.brad, TenTokens);
          });
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(TenTokens),
            ).to.be.revertedWith(YTokenErrors.WithdrawCollateralInsufficientFreeCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(TenTokens),
          ).to.be.revertedWith(YTokenErrors.WithdrawCollateralInsufficientFreeCollateral);
        });
      });
    });

    describe("when the amount to withdraw is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.WithdrawCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).withdrawCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
