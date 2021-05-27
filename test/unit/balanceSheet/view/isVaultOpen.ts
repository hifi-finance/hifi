import { expect } from "chai";

export default function shouldBehaveLikeOpenVault(): void {
  context("when the vault is not open", function () {
    it("retrieves false", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(isVaultOpen).to.equal(false);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    it("retrieves true", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(isVaultOpen).to.equal(true);
    });
  });
}
