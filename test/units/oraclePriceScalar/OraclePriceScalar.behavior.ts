import shouldBehaveLikeGetScaledPrice from "./view/getScaledPrice";

export function shouldBehaveLikeOraclePriceScalar(): void {
  describe("getScaledPrice", function () {
    shouldBehaveLikeGetScaledPrice();
  });
}
