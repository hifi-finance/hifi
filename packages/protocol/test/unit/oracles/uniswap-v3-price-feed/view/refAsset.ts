import { expect } from "chai";

export function shouldBehaveLikeRefAsset(): void {
  it("returns the reference asset of the price feed", async function () {
    const refAsset = await this.contracts.uniswapV3priceFeed.refAsset();
    expect(refAsset).to.equal(await this.mocks.pool.token0());
  });
}
