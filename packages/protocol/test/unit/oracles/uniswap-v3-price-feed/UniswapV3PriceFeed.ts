import { unitFixtureUniswapV3PriceFeed } from "../../../shared/fixtures";
import { shouldBehaveLikeUniswapV3PriceFeed } from "./UniswapV3PriceFeed.behavior";

export function unitTestUniswapV3PriceFeed(): void {
  describe("UniswapV3PriceFeed", function () {
    beforeEach(async function () {
      const { pool, priceFeed, usdc, wbtc } = await this.loadFixture(unitFixtureUniswapV3PriceFeed);
      this.mocks.pool = pool;
      this.mocks.usdc = usdc;
      this.mocks.wbtc = wbtc;
      this.contracts.uniswapV3priceFeed = priceFeed;
    });

    shouldBehaveLikeUniswapV3PriceFeed();
  });
}
