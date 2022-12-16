import { BigNumber } from "@ethersproject/bignumber";
import { NegativeOne, Zero } from "@ethersproject/constants";
import { WBTC_PRICE, WBTC_SYMBOL } from "@hifi/constants";
import { ChainlinkOperatorErrors } from "@hifi/errors";
import { expect } from "chai";
import hre from "hardhat";

export function shouldBehaveLikeGetPrice(): void {
  context("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getPrice("FOO")).to.be.revertedWith(ChainlinkOperatorErrors.FEED_NOT_SET);
    });
  });

  context("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
    });

    context("when the price is stale", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, NegativeOne, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getPrice(WBTC_SYMBOL)).to.be.revertedWith(
          ChainlinkOperatorErrors.PRICE_STALE,
        );
      });
    });

    context("when the price is zero", function () {
      beforeEach(async function () {
        const { timestamp }: { timestamp: number } = await hre.ethers.provider.getBlock("latest");
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, Zero, Zero, timestamp, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getPrice(WBTC_SYMBOL)).to.be.revertedWith(
          ChainlinkOperatorErrors.PRICE_LESS_THAN_OR_EQUAL_TO_ZERO,
        );
      });
    });

    context("when the price is not zero", function () {
      beforeEach(async function () {
        const { timestamp }: { timestamp: number } = await hre.ethers.provider.getBlock("latest");
        await this.mocks.wbtcPriceFeed.mock.latestRoundData.returns(Zero, WBTC_PRICE, Zero, timestamp, Zero);
      });

      it("returns the price", async function () {
        const contractPrice: BigNumber = await this.contracts.oracle.getPrice(WBTC_SYMBOL);
        expect(contractPrice).to.equal(WBTC_PRICE);
      });
    });
  });
}
