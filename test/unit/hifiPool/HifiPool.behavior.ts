import shouldBehaveLikeConstructor from "./constructor";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeGetNormalizedUnderlyingReserves from "./view/getNormalizedUnderlyingReserves";
import shouldBehaveLikeGetVirtualHTokenReserves from "./view/getVirtualHTokenReserves";

export function shouldBehaveLikeHifiPool(): void {
  describe("Deployment", function () {
    shouldBehaveLikeConstructor();
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

    describe("getVirtualHTokenReserves", function () {
      shouldBehaveLikeGetVirtualHTokenReserves();
    });
  });
}
