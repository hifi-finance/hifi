import { expect } from "chai";

export function shouldBehaveLikeBaseAsset(): void {
  it("returns the base asset of the price feed", async function () {
    const baseAsset = await this.contracts.uniswapV3priceFeed.baseAsset();
    expect(baseAsset).to.equal(await this.mocks.pool.token1());
  });
}
