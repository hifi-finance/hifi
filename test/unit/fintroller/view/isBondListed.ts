import { expect } from "chai";

export default function shouldBehaveLikeIsBondListed(): void {
  describe("when the bond is not listed", function () {
    it("retrieves false", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.stubs.fyToken.address);
      expect(isBondListed).to.equal(false);
    });
  });

  describe("when the vault is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
    });

    it("retrieves true", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.stubs.fyToken.address);
      expect(isBondListed).to.equal(true);
    });
  });
}
