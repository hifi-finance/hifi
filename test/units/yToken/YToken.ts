import { shouldBehaveLikeYToken } from "./YToken.behavior";
import { unitFixtureYToken } from "../fixtures";

export function unitTestYToken(): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        yToken,
      } = await this.loadFixture(unitFixtureYToken);
      this.contracts.yToken = yToken;
      this.stubs.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.redemptionPool = redemptionPool;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeYToken();
  });
}
