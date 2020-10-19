import shouldBehaveLikeRedeemYTokens from "./effects/redeemYTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeemYTokens", function () {
      shouldBehaveLikeRedeemYTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
