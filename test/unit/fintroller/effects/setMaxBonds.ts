import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { DEFAULT_MAX_BONDS } from "../../../../helpers/constants";
import { OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetMaxBonds(): void {
  const newMaxBonds: BigNumber = DEFAULT_MAX_BONDS.add(1);

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.connect(this.signers.raider).setMaxBonds(newMaxBonds)).to.be.revertedWith(
        OwnableUpgradeableErrors.NotOwner,
      );
    });
  });

  context("when the caller is the owner", function () {
    it("sets a new value", async function () {
      await this.contracts.fintroller.setMaxBonds(newMaxBonds);
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(newMaxBonds);
    });
  });
}
