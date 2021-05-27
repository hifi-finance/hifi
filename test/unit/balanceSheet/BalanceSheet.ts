import { unitFixtureBalanceSheet } from "../fixtures";
import { shouldBehaveLikeBalanceSheet } from "./BalanceSheet.behavior";

export function unitTestBalanceSheet(): void {
  describe("BalanceSheet", function () {
    beforeEach(async function () {
      const { balanceSheet, collateral, fintroller, oracle, underlying, hToken } = await this.loadFixture(
        unitFixtureBalanceSheet,
      );
      this.contracts.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.underlying = underlying;
      this.stubs.hToken = hToken;
    });

    shouldBehaveLikeBalanceSheet();
  });
}
