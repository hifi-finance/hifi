import { expect } from "chai";

export function shouldBehaveLikeIsBondListed(): void {
  context("when the bond is not listed", function () {
    it("returns false", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.mocks.hTokens[0].address);
      expect(isBondListed).to.equal(false);
    });
  });

  context("when the vault is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
    });

    it("returns true", async function () {
      const isBondListed: boolean = await this.contracts.fintroller.isBondListed(this.mocks.hTokens[0].address);
      expect(isBondListed).to.equal(true);
    });
  });
}
