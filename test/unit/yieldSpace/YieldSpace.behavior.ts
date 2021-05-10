import shouldBehaveLikeFyTokenInForUnderlyingOut from "./pure/fyTokenInForUnderlyingOut";
import shouldBehaveLikeGetYieldExponent from "./pure/getYieldExponent";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("fyTokenInForUnderlyingOut", function () {
      shouldBehaveLikeFyTokenInForUnderlyingOut();
    });

    describe("getYieldExponent", function () {
      shouldBehaveLikeGetYieldExponent();
    });
  });
}
