import shouldBehaveLikeConstructor from "./constructor";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeToInt256 from "./pure/toInt256";
import shouldBehaveLikeGetNormalizedUnderlyingReserves from "./view/getNormalizedUnderlyingReserves";
import shouldBehaveLikeGetVirtualHTokenReserves from "./view/getVirtualHTokenReserves";

export function shouldBehaveLikeHifiPool(): void {
  describe("Deployment", function () {
    shouldBehaveLikeConstructor();
  });

  describe("Pure Functions", function () {
    describe("toInt256", function () {
      shouldBehaveLikeToInt256();
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

  describe("Effects Functions", function () {
    describe("burn", function () {
      shouldBehaveLikeBurn();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });
  });
}
