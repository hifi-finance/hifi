import shouldBehaveLikeGetAdjustedPrice from "./view/getAdjustedPrice";
import shouldBehaveLikeGetFeed from "./view/getFeed";
import shouldBehaveLikeGetPrice from "./view/getPrice";

import shouldBehaveLikeDeleteFeed from "./effects/deleteFeed";
import shouldBehaveLikeSetFeed from "./effects/setFeed";

export function shouldBehaveLikeChainlinkOperator(): void {
  describe("View Functions", function () {
    describe("getAdjustedPrice", function () {
      shouldBehaveLikeGetAdjustedPrice();
    });

    describe("getFeed", function () {
      shouldBehaveLikeGetFeed();
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
