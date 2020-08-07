import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../errors";
import { TenTokens } from "../../../constants";

export default function shouldBehaveLikeDeposit(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(admin)._listBond(this.yToken.address);
      });

      describe("when the fintroller allows new deposits", function () {
        beforeEach(async function() {
          await this.fintroller.connect(admin)._setDepositAllowed(this.yToken.address, true);
        });

        describe("when the yToken contract has enough allowance", function () {
          beforeEach(async function() {
            await this.collateral.connect(bob).approve(this.yToken.address, TenTokens);
          });

          it("makes the deposit", async function () {
            await this.yToken.connect(bob).deposit(TenTokens);
          });
        });

        describe("when the yToken contract does not have enough allowance", function () {
          it("reverts", async function() {
            await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.reverted;
          });
        });
      });

      describe("when the fintroller does not allow new deposits", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(YTokenErrors.DepositNotAllowed);
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
