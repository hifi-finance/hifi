import { balanceSheetFixture, loadFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeBalanceSheet } from "./BalanceSheet.behavior";

export function testBalanceSheet(): void {
  describe("BalanceSheet", function () {
    beforeEach(async function () {
      const { balanceSheet, collateral, fintroller, oracle, yToken } = await loadFixture.call(this)(
        balanceSheetFixture,
      );
      this.contracts.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeBalanceSheet();
  });
}
