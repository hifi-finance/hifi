import shouldBehaveLikeHifiPoolConstructor from "./constructor";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeGetNormalizedUnderlyingReserves from "./view/getNormalizedUnderlyingReserves";
import shouldBehaveLikeGetVirtualFyTokenReserves from "./view/getVirtualFyTokenReserves";

export function shouldBehaveLikeHifiPool(): void {
  describe("Constructor", function () {
    shouldBehaveLikeHifiPoolConstructor();
  });

  describe("Effects Functions", function () {
    describe("burn", function () {
      shouldBehaveLikeBurn();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });
  });

  describe("View Functions", function () {
    describe("getNormalizedUnderlyingReserves", function () {
      shouldBehaveLikeGetNormalizedUnderlyingReserves();
    });

    describe("getVirtualFyTokenReserves", function () {
      shouldBehaveLikeGetVirtualFyTokenReserves();
    });
  });
}
