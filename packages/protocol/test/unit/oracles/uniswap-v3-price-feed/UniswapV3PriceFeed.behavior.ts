import { shouldBehaveLikeConstructor } from "./deployment/constructor";
import { shouldBehaveLikeDecimals } from "./view/decimals";
import { shouldBehaveLikeDescription } from "./view/description";
import { shouldBehaveLikeGetRoundData } from "./view/getRoundData";
import { shouldBehaveLikeLatestRoundData } from "./view/latestRoundData";
import { shouldBehaveLikePool } from "./view/pool";
import { shouldBehaveLikeRefAsset } from "./view/refAsset";
import { shouldBehaveLikeTwapInterval } from "./view/twapInterval";
import { shouldBehaveLikeVersion } from "./view/version";

export function shouldBehaveLikeUniswapV3PriceFeed(): void {
  describe("Deployment", function () {
    describe("constructor", function () {
      shouldBehaveLikeConstructor();
    });
  });

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

    describe("decimals", function () {
      shouldBehaveLikeDecimals();
    });

    describe("version", function () {
      shouldBehaveLikeVersion();
    });

    describe("getRoundData", function () {
      shouldBehaveLikeGetRoundData();
    });

    describe("latestRoundData", function () {
      shouldBehaveLikeLatestRoundData();
    });
  });
}
