import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeBurnBehalf from "./effects/burnBehalf";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeFreeCollateral from "./effects/freeCollateral";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeRedeem from "./effects/redeem";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";

import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeRedeemableUnderlyingTotalSupplyGetter from "./view/redeemableUnderlyingTotalSupply";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeVaultGetter from "./view/vault";

export function shouldBehaveLikeYToken(): void {
  describe("Effects Functions", function () {
    describe("burn", function () {
      shouldBehaveLikeBurn();
    });

    describe("burnBehalf", function () {
      shouldBehaveLikeBurnBehalf();
    });

    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });

    describe("freeCollateral", function () {
      shouldBehaveLikeFreeCollateral();
    });

    describe("lockCollateral", function () {
      shouldBehaveLikeLockCollateral();
    });

    describe("mint", function () {
      shouldBehaveLikeMint();
    });

    describe("redeem", function () {
      shouldBehaveLikeRedeem();
    });

    describe("withdrawCollateral", function () {
      shouldBehaveLikeWithdrawCollateral();
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

    describe("redeemableUnderlyingTotalSupply", function () {
      shouldBehaveLikeRedeemableUnderlyingTotalSupplyGetter();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("vault", function () {
      shouldBehaveLikeVaultGetter();
    });
  });
}
