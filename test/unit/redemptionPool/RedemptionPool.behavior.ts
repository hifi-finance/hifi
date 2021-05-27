import shouldBehaveLikeRedeemHTokens from "./effects/redeemHTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";
import shouldBehaveLikeHTokenGetter from "./view/hToken";
import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeTotalUnderlyingSupplyGetter from "./view/totalUnderlyingSupply";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("View Functions", function () {
    describe("hToken", function () {
      shouldBehaveLikeHTokenGetter();
    });

    describe("isRedemptionPool", function () {
      shouldBehaveLikeIsRedemptionPoolGetter();
    });

    describe("totalUnderlyingSupply", function () {
      shouldBehaveLikeTotalUnderlyingSupplyGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("redeemHTokens", function () {
      shouldBehaveLikeRedeemHTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
