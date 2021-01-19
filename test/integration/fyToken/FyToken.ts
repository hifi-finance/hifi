import { shouldBehaveLikeFyToken } from "./FyToken.behavior";
import { integrationFixture } from "../fixtures";

export function integrationTestFyToken(): void {
  describe("FyToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        collateralUsdFeed,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        underlyingUsdFeed,
        fyToken,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.collateralUsdFeed = collateralUsdFeed;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
      this.contracts.underlyingUsdFeed = underlyingUsdFeed;
      this.contracts.fyToken = fyToken;
    });

    shouldBehaveLikeFyToken();
  });
}
