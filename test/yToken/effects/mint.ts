import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../errors";
import { OneHundredTokens } from "../../../constants";

export default function shouldBehaveLikeMint(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(admin)._listBond(this.yToken.address);
      });

      describe("when the fintroller allows new mints", function () {
        beforeEach(async function () {
          await this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, true);
        });
      });

      describe("when the fintroller does not allow new mints", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.MintNotAllowed);
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
