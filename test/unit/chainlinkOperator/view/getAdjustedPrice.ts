import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { ChainlinkOperatorErrors } from "../../../../helpers/errors";
import { chainlinkPricePrecisionScalar, prices } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetAdjustedPrice(): void {
  describe("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getAdjustedPrice("FOO")).to.be.revertedWith(
        ChainlinkOperatorErrors.FeedNotSet,
      );
    });
  });

  describe("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.stubs.collateral.address, this.stubs.collateralUsdFeed.address);
    });

    it("retrieves the adjusted price", async function () {
      const adjustedPrice: BigNumber = await this.contracts.oracle.getAdjustedPrice("WETH");
      expect(adjustedPrice).to.equal(prices.oneHundredDollars.mul(chainlinkPricePrecisionScalar));
    });
  });
}
