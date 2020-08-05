import { Wallet } from "@ethersproject/wallet";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeVaultGetter(bob: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
      /* TODO mint tokens */
    });

    it("should retrieve the vault data", async function () {
      const vault = await this.yToken.getVault(await bob.getAddress());
      /* TODO: change with non-zero collateral values */
      expect(vault.freeCollateral).to.be.equal(Zero);
      expect(vault.lockedCollateral).to.be.equal(Zero);
    });
  });

  describe("when the bond is not open", function () {
    it("should retrieve zero values", async function () {
      const vault = await this.yToken.getVault(await bob.getAddress());
      expect(vault.freeCollateral).to.be.equal(Zero);
      expect(vault.lockedCollateral).to.be.equal(Zero);
    });
  });
}
