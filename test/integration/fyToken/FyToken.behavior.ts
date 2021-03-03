import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeLiquidateBorrow from "./effects/liquidateBorrow";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeRepayBorrow from "./effects/repayBorrow";

export function shouldBehaveLikeFyToken(): void {
  describe("Effects Functions", function () {
    describe("borrow", function () {
      shouldBehaveLikeBorrow();
    });

    describe("burn", function () {
      shouldBehaveLikeBurn();
    });

    describe("liquidateBorrow", function () {
      shouldBehaveLikeLiquidateBorrow();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });

    describe("repayBorrow", function () {
      shouldBehaveLikeRepayBorrow();
    });
  });
}
