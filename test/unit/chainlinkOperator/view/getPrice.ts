import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { ChainlinkOperatorErrors } from "../../../../helpers/errors";
import { price } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetPrice(): void {
  context("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getPrice("FOO")).to.be.revertedWith(ChainlinkOperatorErrors.FeedNotSet);
    });
  });

  context("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
    });

    context("when the price is zero", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(Zero, Zero, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getPrice("WETH")).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
      });
    });

    context("when the price is not zero", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(Zero, price("100"), Zero, Zero, Zero);
      });

      it("retrieves the price", async function () {
        const contractPrice: BigNumber = await this.contracts.oracle.getPrice("WETH");
        expect(contractPrice).to.equal(price("100"));
      });
    });
  });
}
