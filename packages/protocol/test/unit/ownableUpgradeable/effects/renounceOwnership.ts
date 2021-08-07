import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeRenounceOwnership(): void {
  beforeEach(async function () {
    await this.contracts.ownableUpgradeable.connect(this.signers.admin).__OwnableUpgradeable__init();
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.ownableUpgradeable.connect(this.signers.raider)._renounceOwnership(),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    it("renounces ownership", async function () {
      await this.contracts.ownableUpgradeable.connect(this.signers.admin)._renounceOwnership();
      const owner: string = await this.contracts.ownableUpgradeable.owner();
      expect(owner).to.equal(AddressZero);
    });
  });
}
