import shouldBehaveLikeRedeemFyTokens from "./effects/redeemFyTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeemFyTokens", function () {
      shouldBehaveLikeRedeemFyTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
