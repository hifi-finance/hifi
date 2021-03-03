import shouldBehaveLikeConstructor from "./constructor";
import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeBurn from "./effects/burn";
import shouldBehaveLikeLiquidateBorrow from "./effects/liquidateBorrow";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeRepayBorrow from "./effects/repayBorrow";
import shouldBehaveLikeRepayBorrowBehalf from "./effects/repayBorrowBehalf";
import shouldBehaveLikeSetFintroller from "./effects/setFintroller";
import shouldBehaveLikeBalanceSheetGetter from "./view/balanceSheet";
import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeCollateralPrecisionScalarGetter from "./view/collateralPrecisionScalar";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeIsFyTokenGetter from "./view/isFyToken";
import shouldBehaveLikeRedemptionPoolGetter from "./view/redemptionPool";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeUnderlyingPrecisionScalarGetter from "./view/underlyingPrecisionScalar";

export function shouldBehaveLikeFyToken(): void {
  describe("Constructor", function () {
    shouldBehaveLikeConstructor();
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

    describe("isFyToken", function () {
      shouldBehaveLikeIsFyTokenGetter();
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

    describe("repayBorrowBehalf", function () {
      shouldBehaveLikeRepayBorrowBehalf();
    });

    describe("setFintroller", function () {
      shouldBehaveLikeSetFintroller();
    });
  });
}
