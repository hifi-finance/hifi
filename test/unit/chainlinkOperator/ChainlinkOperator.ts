import { unitFixtureChainlinkOperator } from "../fixtures";
import { shouldBehaveLikeChainlinkOperator } from "./ChainlinkOperator.behavior";

export function unitTestChainlinkOperator(): void {
  describe("ChainlinkOperator", function () {
    beforeEach(async function () {
      const { collateral, collateralPriceFeed, oracle } = await this.loadFixture(unitFixtureChainlinkOperator);
      this.contracts.oracle = oracle;
      this.stubs.collateral = collateral;
      this.stubs.collateralPriceFeed = collateralPriceFeed;
    });

    shouldBehaveLikeChainlinkOperator();
  });
}
