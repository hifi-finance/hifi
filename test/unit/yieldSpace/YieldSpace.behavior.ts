import shouldBehaveLikeGetYieldExponent from "./pure/getYieldExponent";
import shouldBehaveLikeHTokenInForUnderlyingOut from "./pure/hTokenInForUnderlyingOut";
import shouldBehaveLikeHTokenOutForUnderlyingIn from "./pure/hTokenOutForUnderlyingIn";
import shouldBehaveLikeUnderlyingInForHTokenOut from "./pure/underlyingInForHTokenOut";
import shouldBehaveLikeUnderlyingOutForHTokenIn from "./pure/underlyingOutForHTokenIn";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("Pure Functions", function () {
      describe("hTokenInForUnderlyingOut", function () {
        shouldBehaveLikeHTokenInForUnderlyingOut();
      });

      describe("hTokenOutForUnderlyingIn", function () {
        shouldBehaveLikeHTokenOutForUnderlyingIn();
      });

      describe("getYieldExponent", function () {
        shouldBehaveLikeGetYieldExponent();
      });

      describe("underlyingInForHTokenOut", function () {
        shouldBehaveLikeUnderlyingInForHTokenOut();
      });

      describe("underlyingOutForHTokenIn", function () {
        shouldBehaveLikeUnderlyingOutForHTokenIn();
      });
    });
  });
}
