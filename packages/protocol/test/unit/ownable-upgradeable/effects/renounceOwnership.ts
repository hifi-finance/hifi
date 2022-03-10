import { AddressZero } from "@ethersproject/constants";
import { OwnableUpgradeableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeRenounceOwnership(): void {
  beforeEach(async function () {
    await this.contracts.ownableUpgradeable.connect(this.signers.admin).__godMode_Ownable_init();
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.ownableUpgradeable.connect(this.signers.raider)._renounceOwnership(),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NOT_OWNER);
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
