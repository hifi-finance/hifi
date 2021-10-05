import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export function shouldBehaveLikeOwnerGetter(): void {
  context("when the contract was not initialized", function () {
    it("returns the zero address", async function () {
      const owner: string = await this.contracts.ownableUpgradeable.owner();
      expect(owner).to.equal(AddressZero);
    });
  });

  context("when the contract was initialized", function () {
    beforeEach(async function () {
      await this.contracts.ownableUpgradeable.connect(this.signers.admin).__OwnableUpgradeable__init();
    });

    it("returns the correct address", async function () {
      const owner: string = await this.contracts.ownableUpgradeable.owner();
      expect(owner).to.equal(this.signers.admin.address);
    });
  });
}
