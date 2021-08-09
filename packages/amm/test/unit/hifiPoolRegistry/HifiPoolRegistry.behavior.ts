import shouldBehaveLikeTrackPool from "./effects/trackPool";
import shouldBehaveLikeUntrackPool from "./effects/untrackPool";

export function shouldBehaveLikeHifiPoolRegistry(): void {
  describe("Effects Functions", function () {
    describe("trackPool", function () {
      shouldBehaveLikeTrackPool();
    });

    describe("untrackPool", function () {
      shouldBehaveLikeUntrackPool();
    });
  });
}
