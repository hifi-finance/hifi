import shouldBehaveLikeConstructor from "./constructor";

import shouldBehaveLikeDepositGuaranty from "./effects/depositGuaranty";

import shouldBehaveLikeIsGuarantorPoolGetter from "./view/isGuarantorPool";
import shouldBehaveLikeTotalGuarantyGetter from "./view/totalGuaranty";

export function shouldBehaveLikeGuarantorPool(): void {
  describe("Constructor", function () {
    shouldBehaveLikeConstructor();
  });

  describe("Effects Functions", function () {
    describe("depositGuaranty", function () {
      shouldBehaveLikeDepositGuaranty();
    });
  });

  describe("View Functions", function () {
    describe("isGuarantorPool", function () {
      shouldBehaveLikeIsGuarantorPoolGetter();
    });

    describe("totalGuaranty", function () {
      shouldBehaveLikeTotalGuarantyGetter();
    });
  });
}
