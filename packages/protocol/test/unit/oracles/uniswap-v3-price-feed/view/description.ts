import { USDC_SYMBOL, WBTC_SYMBOL } from "@hifi/constants";
import { expect } from "chai";

export function shouldBehaveLikeDescription(): void {
  it("returns the description of the price feed", async function () {
    const description = await this.contracts.uniswapV3priceFeed.description();
    expect(description).to.equal(WBTC_SYMBOL + " / " + USDC_SYMBOL);
  });
}
