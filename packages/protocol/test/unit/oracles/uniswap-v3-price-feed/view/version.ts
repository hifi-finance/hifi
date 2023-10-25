import { expect } from "chai";

export function shouldBehaveLikeVersion(): void {
  it("returns the price feed version", async function () {
    const version = await this.contracts.uniswapV3priceFeed.version();
    expect(version).to.equal(1);
  });
}
