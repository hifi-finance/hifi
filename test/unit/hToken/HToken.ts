import { unitFixtureHToken } from "../fixtures";
import { shouldBehaveLikeHToken } from "./HToken.behavior";

export function unitTestHToken(): void {
  describe("HToken", function () {
    beforeEach(async function () {
      const { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, hToken } =
        await this.loadFixture(unitFixtureHToken);
      this.contracts.hToken = hToken;
      this.stubs.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.redemptionPool = redemptionPool;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeHToken();
  });
}
