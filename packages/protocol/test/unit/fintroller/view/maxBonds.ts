import { BigNumber } from "@ethersproject/bignumber";
import { DEFAULT_MAX_BONDS } from "@hifi/constants";
import { expect } from "chai";

export function shouldBehaveLikeMaxBonds(): void {
  context("when a new value was not set", function () {
    it("returns the default value", async function () {
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(DEFAULT_MAX_BONDS);
    });
  });

  context("when a new value was set", function () {
    const newMaxBonds: BigNumber = DEFAULT_MAX_BONDS.add(1);

    beforeEach(async function () {
      await this.contracts.fintroller.setMaxBonds(newMaxBonds);
    });

    it("returns the new value", async function () {
      const maxBonds: BigNumber = await this.contracts.fintroller.maxBonds();
      expect(maxBonds).to.equal(newMaxBonds);
    });
  });
}
