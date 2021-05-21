import shouldBehaveLikeHifiPoolConstructor from "./constructor";
import shouldBehaveLikeGetNormalizedUnderlyingReserves from "./view/getNormalizedUnderlyingReserves";
import shouldBehaveLikeGetVirtualFyTokenReserves from "./view/getVirtualFyTokenReserves";

export function shouldBehaveLikeHifiPool(): void {
  describe("Constructor", function () {
    shouldBehaveLikeHifiPoolConstructor();
  });

  describe("View Functions", function () {
    context("getNormalizedUnderlyingReserves", function () {
      shouldBehaveLikeGetNormalizedUnderlyingReserves();
    });

    context("getVirtualFyTokenReserves", function () {
      shouldBehaveLikeGetVirtualFyTokenReserves();
    });
  });
}
