import { expect } from "chai";

export function shouldBehaveLikeQuoteAsset(): void {
  it("returns the quote asset of the price feed", async function () {
    const quoteAsset = await this.contracts.uniswapV3priceFeed.quoteAsset();
    expect(quoteAsset).to.equal(await this.mocks.pool.token0());
  });
}
