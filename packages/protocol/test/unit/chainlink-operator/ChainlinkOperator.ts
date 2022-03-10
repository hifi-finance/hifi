import { unitFixtureChainlinkOperator } from "../../shared/fixtures";
import { shouldBehaveLikeChainlinkOperator } from "./ChainlinkOperator.behavior";

export function unitTestChainlinkOperator(): void {
  describe("ChainlinkOperator", function () {
    beforeEach(async function () {
      const { oracle, wbtc, wbtcPriceFeed } = await this.loadFixture(unitFixtureChainlinkOperator);
      this.contracts.oracle = oracle;
      this.mocks.wbtc = wbtc;
      this.mocks.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeChainlinkOperator();
  });
}
