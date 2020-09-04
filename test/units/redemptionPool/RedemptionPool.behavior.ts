import shouldBehaveLikeIsRedemptionPoolGetter from "./view/isRedemptionPool";
import shouldBehaveLikeUnderlyingSupplyGetter from "./view/underlyingSupply";
import shouldBehaveLikeOracleYTokenGetter from "./view/yToken";

export function shouldBehaveLikeRedemptionPool(): void {
  describe("View Functions", function () {
    describe.only("isRedemptionPool", function () {
      shouldBehaveLikeIsRedemptionPoolGetter();
    });

    describe("underlyingSupply", function () {
      shouldBehaveLikeUnderlyingSupplyGetter();
    });

    describe("yToken", function () {
      shouldBehaveLikeOracleYTokenGetter();
    });
  });
}
