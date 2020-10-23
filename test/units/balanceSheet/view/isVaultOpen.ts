import { expect } from "chai";

export default function shouldBehaveLikeOpenVault(): void {
  describe("when the vault is not open", function () {
    it("retrieves false", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.fyToken.address,
        this.accounts.borrower,
      );
      expect(isVaultOpen).to.equal(false);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
    });

    it("retrieves true", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.fyToken.address,
        this.accounts.borrower,
      );
      expect(isVaultOpen).to.equal(true);
    });
  });
}
