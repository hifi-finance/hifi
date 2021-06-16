import { expect } from "chai";

import { OwnableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeTransferOwnership(): void {
  beforeEach(async function () {
    await this.contracts.ownableUpgradeable.connect(this.signers.admin).__OwnableUpgradeable__init();
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      const newOwner: string = this.signers.maker.address;
      await expect(
        this.contracts.ownableUpgradeable.connect(this.signers.raider)._transferOwnership(newOwner),
      ).to.be.revertedWith(OwnableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    it("transfers the ownership", async function () {
      const newOwner: string = this.signers.maker.address;
      await this.contracts.ownableUpgradeable.connect(this.signers.admin)._transferOwnership(newOwner);
      const owner: string = await this.contracts.ownableUpgradeable.owner();
      expect(owner).to.equal(newOwner);
    });
  });
}
