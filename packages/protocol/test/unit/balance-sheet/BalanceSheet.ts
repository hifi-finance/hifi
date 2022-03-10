import { unitFixtureBalanceSheet } from "../../shared/fixtures";
import { shouldBehaveLikeBalanceSheet } from "./BalanceSheet.behavior";

export function unitTestBalanceSheet(): void {
  describe("BalanceSheet", function () {
    beforeEach(async function () {
      const { balanceSheet, fintroller, hTokens, oracle, usdc, wbtc, weth } = await this.loadFixture(
        unitFixtureBalanceSheet,
      );
      this.contracts.balanceSheet = balanceSheet;
      this.mocks.fintroller = fintroller;
      this.mocks.oracle = oracle;
      this.mocks.hTokens = hTokens;
      this.mocks.usdc = usdc;
      this.mocks.wbtc = wbtc;
      this.mocks.weth = weth;
    });

    shouldBehaveLikeBalanceSheet();
  });
}
