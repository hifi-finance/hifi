import { shouldBehaveLikeConstructor } from "./deployment/constructor";
import { shouldBehaveLikeSetMaxPrice } from "./effects/setMaxPrice";
import { shouldBehaveLikeBaseAsset } from "./view/baseAsset";
import { shouldBehaveLikeDecimals } from "./view/decimals";
import { shouldBehaveLikeDescription } from "./view/description";
import { shouldBehaveLikeGetRoundData } from "./view/getRoundData";
import { shouldBehaveLikeLatestRoundData } from "./view/latestRoundData";
import { shouldBehaveLikeMaxPrice } from "./view/maxPrice";
import { shouldBehaveLikePool } from "./view/pool";
import { shouldBehaveLikeQuoteAsset } from "./view/quoteAsset";
import { shouldBehaveLikeTwapInterval } from "./view/twapInterval";
import { shouldBehaveLikeVersion } from "./view/version";

export function shouldBehaveLikeUniswapV3PriceFeed(): void {
  describe("Deployment", function () {
    describe("constructor", function () {
      shouldBehaveLikeConstructor();
    });
  });

  describe("View Functions", function () {
    describe("baseAsset", function () {
      shouldBehaveLikeBaseAsset();
    });

    describe("description", function () {
      shouldBehaveLikeDescription();
    });

    describe("maxPrice", function () {
      shouldBehaveLikeMaxPrice();
    });

    describe("pool", function () {
      shouldBehaveLikePool();
    });

    describe("quoteAsset", function () {
      shouldBehaveLikeQuoteAsset();
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

  describe("Effects Functions", function () {
    describe("setMaxPrice", function () {
      shouldBehaveLikeSetMaxPrice();
    });
  });
}
