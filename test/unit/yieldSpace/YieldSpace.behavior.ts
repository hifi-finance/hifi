import shouldBehaveLikeFyTokenInForUnderlyingOut from "./pure/fyTokenInForUnderlyingOut";
import shouldBehaveLikeFyTokenOutForUnderlyingIn from "./pure/fyTokenOutForUnderlyingIn";
import shouldBehaveLikeGetYieldExponent from "./pure/getYieldExponent";
import shouldBehaveLikeUnderlyingInForFyTokenOut from "./pure/underlyingInForFyTokenOut";
import shouldBehaveLikeUnderlyingOutForFyTokenIn from "./pure/underlyingOutForFyTokenIn";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("fyTokenInForUnderlyingOut", function () {
      shouldBehaveLikeFyTokenInForUnderlyingOut();
    });

    describe("fyTokenOutForUnderlyingIn", function () {
      shouldBehaveLikeFyTokenOutForUnderlyingIn();
    });

    describe("getYieldExponent", function () {
      shouldBehaveLikeGetYieldExponent();
    });

    describe("underlyingInForFyTokenOut", function () {
      shouldBehaveLikeUnderlyingInForFyTokenOut();
    });

    describe("underlyingOutForFyTokenIn", function () {
      shouldBehaveLikeUnderlyingOutForFyTokenIn();
    });
  });
}
