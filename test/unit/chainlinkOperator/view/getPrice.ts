import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
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
        .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
    });

    describe("when the price is zero", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(Zero, Zero, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getPrice("WETH")).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
      });
    });

    describe("when the price is not zero", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(
          Zero,
          prices.oneHundredDollars,
          Zero,
          Zero,
          Zero,
        );
      });

      it("retrieves the price", async function () {
        const price: BigNumber = await this.contracts.oracle.getPrice("WETH");
        expect(price).to.equal(prices.oneHundredDollars);
      });
    });
  });
}
