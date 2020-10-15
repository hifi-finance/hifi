import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeLiquidateBorrow from "./effects/liquidateBorrow";

export function shouldBehaveLikeYToken(): void {
  describe("Effects Functions", function () {
    describe("borrow", function () {
      shouldBehaveLikeBorrow();
    });

    describe("liquidateBorrow", function () {
      shouldBehaveLikeLiquidateBorrow();
    });
  });
}
