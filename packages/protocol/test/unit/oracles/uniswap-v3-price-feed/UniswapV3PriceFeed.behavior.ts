import { shouldBehaveLikeDescription } from "./view/description";
import { shouldBehaveLikeGetRoundData } from "./view/getRoundData";
import { shouldBehaveLikeLatestRoundData } from "./view/latestRoundData";
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

    describe("getRoundData", function () {
      shouldBehaveLikeGetRoundData();
    });

    describe("latestRoundData", function () {
      shouldBehaveLikeLatestRoundData();
    });
  });
}
