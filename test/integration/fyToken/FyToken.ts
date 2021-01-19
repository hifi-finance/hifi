import { shouldBehaveLikeFyToken } from "./FyToken.behavior";
import { integrationFixture } from "../fixtures";

export function integrationTestFyToken(): void {
  describe("FyToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        collateralPriceFeed,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        underlyingPriceFeed,
        fyToken,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.collateralPriceFeed = collateralPriceFeed;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
      this.contracts.underlyingPriceFeed = underlyingPriceFeed;
      this.contracts.fyToken = fyToken;
    });

    shouldBehaveLikeFyToken();
  });
}
