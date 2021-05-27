import { integrationFixture } from "../fixtures";
import { shouldBehaveLikeHToken } from "./HToken.behavior";

export function integrationTestHToken(): void {
  describe("HToken", function () {
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
        hToken,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.collateralPriceFeed = collateralPriceFeed;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
      this.contracts.underlyingPriceFeed = underlyingPriceFeed;
      this.contracts.hToken = hToken;
    });

    shouldBehaveLikeHToken();
  });
}
