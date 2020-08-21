import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { YTokenErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the collateral amount to lock is not zero", function () {
      describe("when the user deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);
          await this.stubs.fintroller
            .connect(this.signers.admin)
            .setDepositAllowed(this.contracts.yToken.address, true);
          await this.stubs.collateral.connect(this.signers.brad).approve(this.contracts.yToken.address, TenTokens);
          await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
        });

        it("it locks the collateral", async function () {
          const preVault = await this.contracts.yToken.getVault(this.accounts.brad);
          await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
          const postVault = await this.contracts.yToken.getVault(this.accounts.brad);
          expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.add(TenTokens));
          expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.sub(TenTokens));
        });

        it("emits a LockCollateral event", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens))
            .to.emit(this.contracts.yToken, "LockCollateral")
            .withArgs(this.accounts.brad, TenTokens);
        });
      });

      describe("when the user did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens)).to.be.revertedWith(
            YTokenErrors.LockCollateralInsufficientFreeCollateral,
          );
        });
      });
    });

    describe("when the collateral amount to lock is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).lockCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.LockCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
