import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { ChainlinkOperatorErrors } from "../../../../helpers/errors";
import { prices } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetPrice(): void {
  describe("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getPrice("FOO")).to.be.revertedWith(ChainlinkOperatorErrors.FeedNotSet);
    });
  });

  describe("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.stubs.collateral.address, this.stubs.collateralUsdFeed.address);
    });

    it("retrieves the price", async function () {
      const price: BigNumber = await this.contracts.oracle.getPrice("WETH");
      expect(price).to.equal(prices.oneHundredDollars);
    });
  });
}
