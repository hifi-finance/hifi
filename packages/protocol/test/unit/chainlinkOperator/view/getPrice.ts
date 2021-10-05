import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { WBTC_PRICE, WBTC_SYMBOL } from "@hifi/constants";
import { expect } from "chai";

import { ChainlinkOperatorErrors } from "../../../shared/errors";

export function shouldBehaveLikeGetPrice(): void {
  context("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getPrice("FOO")).to.be.revertedWith(ChainlinkOperatorErrors.FeedNotSet);
    });
  });

  context("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
    });

    context("when the price is zero", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, Zero, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getPrice(WBTC_SYMBOL)).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
      });
    });

    context("when the price is not zero", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, WBTC_PRICE, Zero, Zero, Zero);
      });

      it("returns the price", async function () {
        const contractPrice: BigNumber = await this.contracts.oracle.getPrice(WBTC_SYMBOL);
        expect(contractPrice).to.equal(WBTC_PRICE);
      });
    });
  });
}
