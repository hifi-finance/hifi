import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeVaultGetter from "./view/vault";

export function shouldBehaveLikeYToken(): void {
  describe("Effects Functions", function () {
    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
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
