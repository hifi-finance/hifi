import shouldBehaveLikeFyTokenOutForUnderlyingIn from "./pure/fyTokenOutForUnderlyingIn";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("fyTokenOutForUnderlyingIn", function () {
      shouldBehaveLikeFyTokenOutForUnderlyingIn();
    });
  });
}
