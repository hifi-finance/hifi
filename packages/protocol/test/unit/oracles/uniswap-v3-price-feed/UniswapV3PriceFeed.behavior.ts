import { shouldBehaveLikeDescription } from "./view/description";
import { shouldBehaveLikePool } from "./view/pool";
import { shouldBehaveLikeRefAsset } from "./view/refAsset";
import { shouldBehaveLikeTwapInterval } from "./view/twapInterval";

export function shouldBehaveLikeUniswapV3PriceFeed(): void {
  describe("View Functions", function () {
    describe("description", function () {
      shouldBehaveLikeDescription();
    });

    describe("pool", function () {
      shouldBehaveLikePool();
    });

    describe("refAsset", function () {
      shouldBehaveLikeRefAsset();
    });

    describe("twapInterval", function () {
      shouldBehaveLikeTwapInterval();
    });
  });
}
