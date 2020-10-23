import shouldBehaveLikeFyTokenGetter from "./view/fyToken";
import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeTotalUnderlyingSupplyGetter from "./view/totalUnderlyingSupply";
import shouldBehaveLikeRedeemFyTokens from "./effects/redeemFyTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("View Functions", function () {
    describe("fyToken", function () {
      shouldBehaveLikeFyTokenGetter();
    });

    describe("isRedemptionPool", function () {
      shouldBehaveLikeIsRedemptionPoolGetter();
    });

    describe("totalUnderlyingSupply", function () {
      shouldBehaveLikeTotalUnderlyingSupplyGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("redeemFyTokens", function () {
      shouldBehaveLikeRedeemFyTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
