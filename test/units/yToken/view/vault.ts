import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeVaultGetter(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
      /* TODO mint tokens */
    });

    it("retrieves the vault data", async function () {
      const vault = await this.contracts.yToken.getVault(this.accounts.brad);
      expect(vault.freeCollateral).to.equal(Zero);
      expect(vault.lockedCollateral).to.equal(Zero);
      expect(vault.debt).to.equal(Zero);
    });

    /* TODO: test for other collateral values */
  });

  describe("when the bond is not open", function () {
    it("retrieves zero values", async function () {
      const vault = await this.contracts.yToken.getVault(this.accounts.brad);
      expect(vault.freeCollateral).to.equal(Zero);
      expect(vault.lockedCollateral).to.equal(Zero);
    });
  });
}
