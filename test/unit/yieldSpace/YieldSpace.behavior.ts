import shouldBehaveLikeGetA from "./pure/getA";

export function shouldBehaveLikeYieldSpace(): void {
  describe("YieldSpaceMock", function () {
    describe("getA", function () {
      shouldBehaveLikeGetA();
    });
  });
}
