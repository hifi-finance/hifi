import { expect } from "chai";
import { ethers } from "hardhat";

export function shouldBehaveLikeLatestRoundData(): void {
  context("when token0 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(await this.contracts.uniswapV3priceFeed.refAsset());
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([-798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("1");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("1000000000000000000000000");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("10001000000");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });
  });

  context("when token1 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(this.mocks.wbtc.address);
      await this.mocks.pool.mock.token1.returns(this.mocks.usdc.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setPool(this.mocks.pool.address);
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([-798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("3402567868363880940706423398996811727621851270355");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("1");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        expect(answer).to.equal("9999000099");
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });
  });
}
