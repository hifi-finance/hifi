import shouldBehaveLikeGetNormalizedUnderlyingReserves from "./view/getNormalizedUnderlyingReserves";
import shouldBehaveLikeGetVirtualFyTokenReserves from "./view/getVirtualFyTokenReserves";

export function shouldBehaveLikeHifiPool(): void {
  context("getNormalizedUnderlyingReserves", function () {
    shouldBehaveLikeGetNormalizedUnderlyingReserves();
  });

  context("getVirtualFyTokenReserves", function () {
    shouldBehaveLikeGetVirtualFyTokenReserves();
  });
}
