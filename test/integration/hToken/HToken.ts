import { integrationFixture } from "../../shared/fixtures";
import { shouldBehaveLikeHToken } from "./HToken.behavior";

export function integrationTestHToken(): void {
  describe("HToken", function () {
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

    shouldBehaveLikeHToken();
  });
}
