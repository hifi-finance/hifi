import shouldBehaveLikeFyTokenInForUnderlyingOut from "./pure/fyTokenInForUnderlyingOut";
import shouldBehaveLikeGetYieldExponent from "./pure/getYieldExponent";
import shouldBehaveLikeUnderlyingInForFyTokenOut from "./pure/underlyingInForFyTokenOut";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("fyTokenInForUnderlyingOut", function () {
      shouldBehaveLikeFyTokenInForUnderlyingOut();
    });

    describe("getYieldExponent", function () {
      shouldBehaveLikeGetYieldExponent();
    });

    describe("underlyingInForFyTokenOut", function () {
      shouldBehaveLikeUnderlyingInForFyTokenOut();
    });
  });
}
