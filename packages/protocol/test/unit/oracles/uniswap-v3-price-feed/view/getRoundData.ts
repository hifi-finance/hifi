import { expect } from "chai";

export function shouldBehaveLikeGetRoundData(): void {
  context("when token0 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(await this.contracts.uniswapV3priceFeed.refAsset());
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([-798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("1");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("1000000000000000000000000");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("10001000000");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });
  });

  context("when token1 is the reference asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token1.returns(await this.contracts.uniswapV3priceFeed.refAsset());
    });

    context("when sqrtPriceX96 is minimum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([-798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("340256786836388094070642339899681172762184834");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is maximum ", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([798544800, 0], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("1");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });

    context("when sqrtPriceX96 is above minimum and below maximum", function () {
      it("returns the correct value", async function () {
        await this.mocks.pool.mock.observe.withArgs([900, 0]).returns([1800, 900], [0, 0]);
        const { roundId, answer, startedAt, updatedAt, answeredInRound } =
          await this.contracts.uniswapV3priceFeed.getRoundData(123);
        expect(roundId).to.equal(123);
        expect(answer).to.equal("999900");
        expect(startedAt).to.equal(0);
        expect(updatedAt).to.equal(0);
        expect(answeredInRound).to.equal(0);
      });
    });
  });
}
