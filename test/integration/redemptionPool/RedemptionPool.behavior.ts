import shouldBehaveLikeRedeemHTokens from "./effects/redeemHTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeemHTokens", function () {
      shouldBehaveLikeRedeemHTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
