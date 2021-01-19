import { shouldBehaveLikeChainlinkOperator } from "./ChainlinkOperator.behavior";
import { unitFixtureChainlinkOperator } from "../fixtures";

export function unitTestChainlinkOperator(): void {
  describe("ChainlinkOperator", function () {
    beforeEach(async function () {
      const { collateral, collateralUsdFeed, oracle } = await this.loadFixture(unitFixtureChainlinkOperator);
      this.contracts.oracle = oracle;
      this.stubs.collateral = collateral;
      this.stubs.collateralUsdFeed = collateralUsdFeed;
    });

    shouldBehaveLikeChainlinkOperator();
  });
}
