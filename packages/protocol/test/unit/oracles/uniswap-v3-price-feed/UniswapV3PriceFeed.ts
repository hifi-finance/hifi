import { unitFixtureUniswapV3PriceFeed } from "../../../shared/fixtures";
import { shouldBehaveLikeUniswapV3PriceFeed } from "./UniswapV3PriceFeed.behavior";

export function unitTestUniswapV3PriceFeed(): void {
  describe("UniswapV3PriceFeed", function () {
    beforeEach(async function () {
      const { pool, priceFeed } = await this.loadFixture(unitFixtureUniswapV3PriceFeed);
      this.mocks.pool = pool;
      this.contracts.uniswapV3priceFeed = priceFeed;
    });

    shouldBehaveLikeUniswapV3PriceFeed();
  });
}
