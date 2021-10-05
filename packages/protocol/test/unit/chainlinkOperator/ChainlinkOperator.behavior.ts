import { shouldBehaveLikeDeleteFeed } from "./effects/deleteFeed";
import { shouldBehaveLikeSetFeed } from "./effects/setFeed";
import { shouldBehaveLikeGetFeed } from "./view/getFeed";
import { shouldBehaveLikeGetNormalizedPrice } from "./view/getNormalizedPrice";
import { shouldBehaveLikeGetPrice } from "./view/getPrice";

export function shouldBehaveLikeChainlinkOperator(): void {
  describe("View Functions", function () {
    describe("getFeed", function () {
      shouldBehaveLikeGetFeed();
    });

    describe("getNormalizedPrice", function () {
      shouldBehaveLikeGetNormalizedPrice();
    });

    describe("getPrice", function () {
      shouldBehaveLikeGetPrice();
    });
  });

  describe("Effects Functions", function () {
    describe("deleteFeed", function () {
      shouldBehaveLikeDeleteFeed();
    });

    describe("setFeed", function () {
      shouldBehaveLikeSetFeed();
    });
  });
}
