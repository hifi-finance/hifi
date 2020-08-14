import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeMint from "./effects/mint";

import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeVaultGetter from "./view/vault";

export function shouldBehaveLikeYToken(): void {
  describe("Effects Functions", function () {
    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });

    describe("lockCollateral", function() {
      shouldBehaveLikeLockCollateral();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });
  });

  describe("View Functions", function () {
    describe("collateral", function () {
      shouldBehaveLikeCollateralGetter();
    });

    describe("expirationTime", function () {
      shouldBehaveLikeExpirationTimeGetter();
    });

    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("guarantorPool", function () {
      shouldBehaveLikeGuarantorPoolGetter();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("vault", function () {
      shouldBehaveLikeVaultGetter();
    });
  });
}
