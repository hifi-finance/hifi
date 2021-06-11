import { expect } from "chai";

export default function shouldBehaveLikeIsBondListed(): void {
  context("when the bond is not listed", function () {
    it("retrieves false", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.mocks.hTokens[0].address);
      expect(isBondListed).to.equal(false);
    });
  });

  context("when the vault is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.owner).listBond(this.mocks.hTokens[0].address);
    });

    it("retrieves true", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.mocks.hTokens[0].address);
      expect(isBondListed).to.equal(true);
    });
  });
}
