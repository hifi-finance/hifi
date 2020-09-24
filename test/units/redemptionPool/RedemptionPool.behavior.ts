import shouldBehaveLikeRedeemUnderlying from "./effects/redeemUnderlying";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeOracleYTokenGetter from "./view/yToken";
import shouldBehaveLikeTotalUnderlyingSupplyGetter from "./view/totalUnderlyingSupply";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeemUnderlying", function () {
      shouldBehaveLikeRedeemUnderlying();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });

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
}
