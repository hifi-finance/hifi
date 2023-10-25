import { DEFAULT_TWAP_INTERVAL, TICKS } from "@hifi/constants";
import { expect } from "chai";
import { ethers } from "hardhat";

import { calculateTick, tickToTokenPrices } from "../../../../shared/mirrors";

export function shouldBehaveLikeLatestRoundData(): void {
  context("when token0 is the quote asset of the price feed", function () {
    let token0Decimals: number;
    let token1Decimals: number;

    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(this.mocks.usdc.address);
      await this.mocks.pool.mock.token1.returns(this.mocks.wbtc.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setPool(this.mocks.pool.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setQuoteAsset(this.mocks.usdc.address);
      token0Decimals = await this.mocks.usdc.decimals();
      token1Decimals = await this.mocks.wbtc.decimals();
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [TICKS.lowerBound, 0];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[0]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [TICKS.upperBound, 0];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[0]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [3541, 496];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[0]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });
  });

  context("when token1 is the quote asset of the price feed", function () {
    let token0Decimals: number;
    let token1Decimals: number;

    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(this.mocks.wbtc.address);
      await this.mocks.pool.mock.token1.returns(this.mocks.usdc.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setPool(this.mocks.pool.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setQuoteAsset(this.mocks.usdc.address);
      token0Decimals = await this.mocks.wbtc.decimals();
      token1Decimals = await this.mocks.usdc.decimals();
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [TICKS.lowerBound, 0];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[1]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [TICKS.upperBound, 0];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[1]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        const tickCumulatives: number[] = [3541, 496];
        await this.mocks.pool.mock.observe.withArgs([DEFAULT_TWAP_INTERVAL, 0]).returns(tickCumulatives, [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.latestRoundData();
        expect(roundId).to.equal(0);
        const tick = calculateTick(tickCumulatives, DEFAULT_TWAP_INTERVAL);
        const prices = tickToTokenPrices(tick, token0Decimals, token1Decimals);
        expect(answer).to.equal(prices[1]);
        expect(startedAt).to.equal(0);
        const { timestamp }: { timestamp: number } = await ethers.provider.getBlock("latest");
        expect(updatedAt).to.equal(timestamp);
        expect(answeredInRound).to.equal(0);
      });
    });
  });
}
