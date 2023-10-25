import { USDC_SYMBOL, WBTC_SYMBOL } from "@hifi/constants";
import { expect } from "chai";

export function shouldBehaveLikeDescription(): void {
  context("when token0 is the quote asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(this.mocks.usdc.address);
      await this.mocks.pool.mock.token1.returns(this.mocks.wbtc.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setPool(this.mocks.pool.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setQuoteAsset(this.mocks.usdc.address);
    });

    it("returns the description of the price feed", async function () {
      const description = await this.contracts.uniswapV3priceFeed.description();
      expect(description).to.equal(WBTC_SYMBOL + " / " + USDC_SYMBOL);
    });
  });

  context("when token1 is the quote asset of the price feed", function () {
    beforeEach(async function () {
      await this.mocks.pool.mock.token0.returns(this.mocks.usdc.address);
      await this.mocks.pool.mock.token1.returns(this.mocks.wbtc.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setPool(this.mocks.pool.address);
      await this.contracts.uniswapV3priceFeed.__godMode_setQuoteAsset(this.mocks.wbtc.address);
    });

    it("returns the description of the price feed", async function () {
      const description = await this.contracts.uniswapV3priceFeed.description();
      expect(description).to.equal(USDC_SYMBOL + " / " + WBTC_SYMBOL);
    });
  });
}
