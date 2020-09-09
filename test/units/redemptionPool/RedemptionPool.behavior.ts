import shouldBehaveLikeRedeem from "./effects/redeem";
import shouldBehaveLikeSupplyUnderlying from "./effects/supplyUnderlying";

import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeUnderlyingTotalSupplyGetter from "./view/underlyingTotalSupply";
import shouldBehaveLikeOracleYTokenGetter from "./view/yToken";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("Effects Functions", function () {
    describe("redeem", function () {
      shouldBehaveLikeRedeem();
    });

    describe("supplyUnderlying", function () {
      shouldBehaveLikeSupplyUnderlying();
    });
  });

  describe("View Functions", function () {
    describe("isRedemptionPool", function () {
      shouldBehaveLikeIsRedemptionPoolGetter();
    });

    describe("underlyingTotalSupply", function () {
      shouldBehaveLikeUnderlyingTotalSupplyGetter();
    });

    describe("yToken", function () {
      shouldBehaveLikeOracleYTokenGetter();
    });
  });
}
