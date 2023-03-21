import { DEFAULT_TWAP_INTERVAL } from "@hifi/constants";
import { expect } from "chai";

export function shouldBehaveLikeTwapInterval(): void {
  it("returns the TWAP time window", async function () {
    const twapInterval = await this.contracts.uniswapV3priceFeed.twapInterval();
    expect(twapInterval).to.equal(DEFAULT_TWAP_INTERVAL);
  });
}
