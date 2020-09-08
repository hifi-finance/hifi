import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";
import { Vault } from "../../../../@types";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the collateral amount to lock is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.stubs.yToken.address).returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, TenTokens)
            .returns(true);
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, TenTokens);
        });

        it("it locks the collateral", async function () {
          const oldVault: Vault = await this.contracts.balanceSheet.getVault(
            this.stubs.yToken.address,
            this.accounts.brad,
          );
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .lockCollateral(this.stubs.yToken.address, TenTokens);
          const newVault: Vault = await this.contracts.balanceSheet.getVault(
            this.stubs.yToken.address,
            this.accounts.brad,
          );

          expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.add(TenTokens));
          expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.sub(TenTokens));
        });

        it("emits a LockCollateral event", async function () {
          await expect(
            this.contracts.balanceSheet.connect(this.signers.brad).lockCollateral(this.stubs.yToken.address, TenTokens),
          )
            .to.emit(this.contracts.balanceSheet, "LockCollateral")
            .withArgs(this.stubs.yToken.address, this.accounts.brad, TenTokens);
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet.connect(this.signers.brad).lockCollateral(this.stubs.yToken.address, TenTokens),
          ).to.be.revertedWith(BalanceSheetErrors.LockCollateralInsufficientFreeCollateral);
        });
      });
    });

    describe("when the collateral amount to lock is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.brad).lockCollateral(this.stubs.yToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.LockCollateralZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.connect(this.signers.brad).lockCollateral(this.stubs.yToken.address, TenTokens),
      ).to.be.revertedWith(BalanceSheetErrors.VaultNotOpen);
    });
  });
}
