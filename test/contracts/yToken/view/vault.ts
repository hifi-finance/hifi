import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeVaultGetter(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(this.brad).openVault();
      /* TODO mint tokens */
    });

    it("should retrieve the vault data", async function () {
      const vault = await this.yToken.getVault(await this.brad.getAddress());
      expect(vault.freeCollateral).to.be.equal(Zero);
      expect(vault.lockedCollateral).to.be.equal(Zero);
    });

    /* TODO: test for other collateral values */
  });

  describe("when the bond is not open", function () {
    it("should retrieve zero values", async function () {
      const vault = await this.yToken.getVault(await this.brad.getAddress());
      expect(vault.freeCollateral).to.be.equal(Zero);
      expect(vault.lockedCollateral).to.be.equal(Zero);
    });
  });
}
