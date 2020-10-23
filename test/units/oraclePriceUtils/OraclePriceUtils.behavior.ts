import shouldBehaveLikeGetAdjustedPrice from "./view/getAdjustedPrice";

export function shouldBehaveLikeOraclePriceUtils(): void {
  describe("getAdjustedPrice", function () {
    shouldBehaveLikeGetAdjustedPrice();
  });
}
