import { expect } from "chai";
import { BigNumber } from "ethers";

import { bn } from "../../../../helpers/numbers";
import { AdminErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetMaxBonds(): void {
  const newMaxBonds: BigNumber = bn("10");

  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.contracts.fintroller.connect(this.signers.raider).setMaxBonds(newMaxBonds)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  context("when the caller is the admin", function () {
    it("sets a new value", async function () {
      await this.contracts.fintroller.setMaxBonds(newMaxBonds);
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(newMaxBonds);
    });
  });
}
