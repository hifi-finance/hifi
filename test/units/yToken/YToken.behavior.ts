import shouldBehaveLikeConstructor from "./constructor";

import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeRepayBorrow from "./effects/repayBorrow";
import shouldBehaveLikeRepayBorrowBehalf from "./effects/repayBorrowBehalf";

import shouldBehaveLikeCollateralPrecisionScalarGetter from "./view/collateralPrecisionScalar";
import shouldBehaveLikeBalanceSheetGetter from "./view/balanceSheet";
import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeRedemptionPoolGetter from "./view/redemptionPool";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeIsYTokenGetter from "./view/isYToken";
import shouldBehaveLikeUnderlyingPrecisionScalarGetter from "./view/underlyingPrecisionScalar";

export function shouldBehaveLikeYToken(): void {
  describe("Constructor", function () {
    shouldBehaveLikeConstructor();
  });

  describe("Effects Functions", function () {
    describe("borrow", function () {
      shouldBehaveLikeBorrow();
    });

    describe("repayBorrow", function () {
      shouldBehaveLikeRepayBorrow();
    });

    describe("repayBorrowBehalf", function () {
      shouldBehaveLikeRepayBorrowBehalf();
    });
  });

  describe("View Functions", function () {
    describe("balanceSheet", function () {
      shouldBehaveLikeBalanceSheetGetter();
    });

    describe("collateral", function () {
      shouldBehaveLikeCollateralGetter();
    });

    describe("collateralPrecisionScalar", function () {
      shouldBehaveLikeCollateralPrecisionScalarGetter();
    });

    describe("expirationTime", function () {
      shouldBehaveLikeExpirationTimeGetter();
    });

    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("isYToken", function () {
      shouldBehaveLikeIsYTokenGetter();
    });

    describe("redemptionPool", function () {
      shouldBehaveLikeRedemptionPoolGetter();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("underlyingPrecisionScalar", function () {
      shouldBehaveLikeUnderlyingPrecisionScalarGetter();
    });
  });
}
