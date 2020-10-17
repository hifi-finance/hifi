import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeOracleYTokenGetter from "./view/yToken";
import shouldBehaveLikeTotalUnderlyingSupplyGetter from "./view/totalUnderlyingSupply";
import shouldBehaveLikeRedeemYTokens from "./effects/redeemYTokens";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("View Functions", function () {
    describe("isRedemptionPool", function () {
      shouldBehaveLikeIsRedemptionPoolGetter();
    });

    describe("totalUnderlyingSupply", function () {
      shouldBehaveLikeTotalUnderlyingSupplyGetter();
    });

    describe("yToken", function () {
      shouldBehaveLikeOracleYTokenGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("redeemYTokens", function () {
      shouldBehaveLikeRedeemYTokens();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });
}
