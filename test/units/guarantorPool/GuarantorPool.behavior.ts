import shouldBehaveLikeAddLiquidity from "./effects/addLiquidity";

import shouldBehaveLikeIsGuarantorPoolGetter from "./view/isGuarantorPool";
import shouldBehaveLikeTotalLiquidityGetter from "./view/totalLiquidity";

export function shouldBehaveLikeGuarantorPool(): void {
  describe("Effects Functions", function () {
    describe("addLiquidity", function () {
      shouldBehaveLikeAddLiquidity();
    });
  });

  describe("View Functions", function () {
    describe("isGuarantorPool", function () {
      shouldBehaveLikeIsGuarantorPoolGetter();
    });

    describe("totalLiquidity", function () {
      shouldBehaveLikeTotalLiquidityGetter();
    });
  });
}
