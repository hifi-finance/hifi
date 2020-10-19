import shouldBehaveLikeRedeemUnderlying from "./effects/redeemUnderlying";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeemUnderlying", function () {
      shouldBehaveLikeRedeemUnderlying();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
