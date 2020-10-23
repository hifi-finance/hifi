import { unitFixtureOraclePriceUtils } from "../fixtures";
import { shouldBehaveLikeOraclePriceUtils } from "./OraclePriceUtils.behavior";

export function unitTestOraclePriceUtils(): void {
  describe("OraclePriceUtils", function () {
    beforeEach(async function () {
      const { collateral, oracle, oraclePriceUtils } = await this.loadFixture(unitFixtureOraclePriceUtils);
      this.contracts.oraclePriceUtils = oraclePriceUtils;
      this.stubs.collateral = collateral;
      this.stubs.oracle = oracle;
    });

    shouldBehaveLikeOraclePriceUtils();
  });
}
