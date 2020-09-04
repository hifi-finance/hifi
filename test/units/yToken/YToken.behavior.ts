import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeFreeCollateral from "./effects/freeCollateral";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeRedeem from "./effects/redeem";
import shouldBehaveLikeRepayBorrow from "./effects/repayBorrow";
import shouldBehaveLikeRepayBorrowBehalf from "./effects/repayBorrowBehalf";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";

import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeRedemptionPoolGetter from "./view/redemptionPool";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeVaultGetter from "./view/vault";

export function shouldBehaveLikeYToken(): void {
  describe("Effects Functions", function () {
    describe("borrow", function () {
      shouldBehaveLikeBorrow();
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

    describe.skip("redeem", function () {
      shouldBehaveLikeRedeem();
    });

    describe("repayBorrow", function () {
      shouldBehaveLikeRepayBorrow();
    });

    describe("repayBorrowBehalf", function () {
      shouldBehaveLikeRepayBorrowBehalf();
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

    describe("redemptionPool", function () {
      shouldBehaveLikeRedemptionPoolGetter();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("vault", function () {
      shouldBehaveLikeVaultGetter();
    });
  });
}
