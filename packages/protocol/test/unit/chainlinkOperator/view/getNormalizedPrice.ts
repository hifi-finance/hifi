import { BigNumber } from "@ethersproject/bignumber";
import { MaxInt256, Zero } from "@ethersproject/constants";
import { NORMALIZED_WBTC_PRICE, WBTC_SYMBOL } from "@hifi/constants";
import { ChainlinkOperatorErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeGetNormalizedPrice(): void {
  context("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getNormalizedPrice("FOO")).to.be.revertedWith(
        ChainlinkOperatorErrors.FEED_NOT_SET,
      );
    });
  });

  context("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
    });

    context("when the multiplication overflows uint256", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, MaxInt256, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getNormalizedPrice(WBTC_SYMBOL)).to.be.reverted;
      });
    });

    context("when the multiplication does not overflow uint256", function () {
      it("returns the normalized price", async function () {
        const normalizedPrice: BigNumber = await this.contracts.oracle.getNormalizedPrice(WBTC_SYMBOL);
        expect(normalizedPrice).to.equal(NORMALIZED_WBTC_PRICE);
      });
    });
  });
}
