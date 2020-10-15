import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetVault(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    it("retrieves all the storage properties of the vault", async function () {
      const vault = await this.contracts.balanceSheet.getVault(this.stubs.yToken.address, this.accounts.brad);
      expect(vault.debt).to.equal(Zero);
      expect(vault.freeCollateral).to.equal(Zero);
      expect(vault.lockedCollateral).to.equal(Zero);
      expect(vault.isOpen).to.equal(true);
    });
  });

  describe("when the bond is not open", function () {
    it("retrieves the default values", async function () {
      const vault = await this.contracts.balanceSheet.getVault(this.stubs.yToken.address, this.accounts.brad);
      expect(vault.debt).to.equal(Zero);
      expect(vault.freeCollateral).to.equal(Zero);
      expect(vault.lockedCollateral).to.equal(Zero);
      expect(vault.isOpen).to.equal(false);
    });
  });
}
