import shouldBehaveLikeDeleteFeed from "./effects/deleteFeed";
import shouldBehaveLikeSetFeed from "./effects/setFeed";
import shouldBehaveLikegetNormalizedPrice from "./view/getNormalizedPrice";
import shouldBehaveLikeGetFeed from "./view/getFeed";
import shouldBehaveLikeGetPrice from "./view/getPrice";

export function shouldBehaveLikeChainlinkOperator(): void {
  describe("View Functions", function () {
    describe("getFeed", function () {
      shouldBehaveLikeGetFeed();
    });

    describe("getNormalizedPrice", function () {
      shouldBehaveLikegetNormalizedPrice();
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
