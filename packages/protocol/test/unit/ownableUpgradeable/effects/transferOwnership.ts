import { AddressZero } from "@ethersproject/constants";
import { OwnableUpgradeableErrors } from "@hifi/errors";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

export function shouldBehaveLikeTransferOwnership(): void {
  beforeEach(async function () {
    await this.contracts.ownableUpgradeable.connect(this.signers.admin).__OwnableUpgradeable__init();
  });

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      const raider: SignerWithAddress = this.signers.raider;
      await expect(
        this.contracts.ownableUpgradeable.connect(raider)._transferOwnership(raider.address),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the new owner is the zero address", function () {
      it("reverts", async function () {
        const newOwner: string = AddressZero;
        await expect(
          this.contracts.ownableUpgradeable.connect(this.signers.admin)._transferOwnership(newOwner),
        ).to.be.revertedWith(OwnableUpgradeableErrors.OWNER_ZERO_ADDRESS);
      });
    });

    context("when the new owner is not the zero address", function () {
      it("transfers the ownership", async function () {
        const newOwner: string = this.signers.borrower.address;
        await this.contracts.ownableUpgradeable.connect(this.signers.admin)._transferOwnership(newOwner);
        expect(newOwner).to.equal(await this.contracts.ownableUpgradeable.owner());
      });
    });
  });
}
