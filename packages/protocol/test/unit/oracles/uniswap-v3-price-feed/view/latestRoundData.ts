import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeLatestRoundData(): void {
  context("when token0 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(await this.contracts.uniswapV3priceFeed.refAsset());
    });

    it("returns an empty array", async function () {
      await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
      const { roundId, answer, startedAt, updatedAt, answeredInRound } =
        await this.contracts.uniswapV3priceFeed.latestRoundData();
      expect(roundId).to.equal(0);
      expect(answer).to.equal(10001000000);
      expect(startedAt).to.equal(0);
      const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
      expect(updatedAt).to.equal(timestamp);
      expect(answeredInRound).to.equal(0);
    });
  });

  context("when token1 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token1.returns(await this.contracts.uniswapV3priceFeed.refAsset());
    });

    it("returns an empty array", async function () {
      await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
      const { roundId, answer, startedAt, updatedAt, answeredInRound } =
        await this.contracts.uniswapV3priceFeed.latestRoundData();
      expect(roundId).to.equal(0);
      expect(answer).to.equal(999900);
      expect(startedAt).to.equal(0);
      const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
      expect(updatedAt).to.equal(timestamp);
      expect(answeredInRound).to.equal(0);
    });
  });
}
