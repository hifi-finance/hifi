import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { bn } from "../../../../helpers/numbers";

export default function shouldBehaveLikeMaxBonds(): void {
  context("when a new value was not set", function () {
    it("returns zero", async function () {
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(Zero);
    });
  });

  context("when a new value was set", function () {
    const newMaxBonds: BigNumber = bn("10");

    beforeEach(async function () {
      await this.contracts.fintroller.setMaxBonds(newMaxBonds);
    });

    it("returns the new value", async function () {
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(newMaxBonds);
    });
  });
}
