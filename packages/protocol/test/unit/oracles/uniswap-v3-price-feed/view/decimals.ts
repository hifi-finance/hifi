import { expect } from "chai";

export function shouldBehaveLikeDecimals(): void {
  it("returns the price feed decimals", async function () {
    const decimals = await this.contracts.uniswapV3priceFeed.decimals();
    expect(decimals).to.equal(8);
  });
}
