import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetVault(): void {
  context("when the vault is not open", function () {
    it("retrieves the default values", async function () {
      const vault = await this.contracts.balanceSheet.getVault(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(vault[0]).to.equal(Zero); // debt
      expect(vault[1]).to.equal(Zero); // freeCollateral
      expect(vault[2]).to.equal(Zero); // lockedCollateral
      expect(vault[3]).to.equal(false); // isOpen
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    it("retrieves the storage properties of the vault", async function () {
      const vault = await this.contracts.balanceSheet.getVault(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(vault[0]).to.equal(Zero); // debt
      expect(vault[1]).to.equal(Zero); // freeCollateral
      expect(vault[2]).to.equal(Zero); // lockedCollateral
      expect(vault[3]).to.equal(true); // isOpen
    });
  });
}
