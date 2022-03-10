import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeBalanceSheet } from "./BalanceSheet.behavior";

export function integrationTestBalanceSheet(): void {
  describe("BalanceSheet", function () {
    beforeEach(async function () {
      const { balanceSheet, fintroller, hTokens, oracle, usdc, usdcPriceFeed, wbtc, wbtcPriceFeed } =
        await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.hTokens = hTokens;
      this.contracts.usdc = usdc;
      this.contracts.usdcPriceFeed = usdcPriceFeed;
      this.contracts.wbtc = wbtc;
      this.contracts.wbtcPriceFeed = wbtcPriceFeed;
    });

    shouldBehaveLikeBalanceSheet();
  });
}
