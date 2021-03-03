import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { chainlinkPricePrecisionScalar, maxInt256, prices } from "../../../../helpers/constants";
import { ChainlinkOperatorErrors } from "../../../../helpers/errors";

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
        .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
    });

    describe("when the multiplication overflows uint256", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(Zero, maxInt256, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getAdjustedPrice("WETH")).to.be.reverted;
      });
    });

    describe("when the multiplication does not overflow uint256", function () {
      it("retrieves the adjusted price", async function () {
        const adjustedPrice: BigNumber = await this.contracts.oracle.getAdjustedPrice("WETH");
        expect(adjustedPrice).to.equal(prices.oneHundredDollars.mul(chainlinkPricePrecisionScalar));
      });
    });
  });
}
