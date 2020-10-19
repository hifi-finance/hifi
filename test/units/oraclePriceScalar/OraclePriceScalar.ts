import { unitFixtureOraclePriceScalar } from "../fixtures";
import { shouldBehaveLikeOraclePriceScalar } from "./OraclePriceScalar.behavior";

export function unitTestOraclePriceScalar(): void {
  describe("OraclePriceScalar", function () {
    beforeEach(async function () {
      const { collateral, oracle, oraclePriceScalar } = await this.loadFixture(unitFixtureOraclePriceScalar);
      this.contracts.oraclePriceScalar = oraclePriceScalar;
      this.stubs.collateral = collateral;
      this.stubs.oracle = oracle;
    });

    shouldBehaveLikeOraclePriceScalar();
  });
}
