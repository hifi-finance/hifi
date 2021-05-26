import { unitFixtureFyToken } from "../fixtures";
import { shouldBehaveLikeFyToken } from "./FyToken.behavior";

export function unitTestFyToken(): void {
  describe("FyToken", function () {
    beforeEach(async function () {
      const { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, fyToken } =
        await this.loadFixture(unitFixtureFyToken);
      this.contracts.fyToken = fyToken;
      this.stubs.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.redemptionPool = redemptionPool;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeFyToken();
  });
}
