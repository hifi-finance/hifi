import { expect } from "chai";

export function shouldBehaveLikeTwapInterval(): void {
  it("returns the TWAP time window", async function () {
    const twapInterval = await this.contracts.uniswapV3priceFeed.twapInterval();
    expect(twapInterval).to.equal(900);
  });
}
