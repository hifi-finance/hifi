import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../errors";
import { OneHundredTokens } from "../../../constants";

export default function shouldBehaveLikeDeposit(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(admin)._listBond(this.yToken.address);
      });

      // describe("when the fintroller allows new deposits", function () {
        // describe("when there is enough liquidity in the guarantor pool", function () {});
        // describe("when there is not enough liquidity in the guarantor pool", function () {});
      // });

      describe("when the fintroller does not allow new deposits", function () {
        it.skip("reverts", async function () {
          await expect(this.yToken.connect(bob).deposit(OneHundredTokens)).to.be.revertedWith(
            YTokenErrors.DepositNotAllowed,
          );
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(bob).deposit(OneHundredTokens)).to.be.revertedWith(
          FintrollerErrors.BondNotListed,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(bob).deposit(OneHundredTokens)).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
