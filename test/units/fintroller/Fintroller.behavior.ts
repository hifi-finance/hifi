import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDepositAllowed from "./effects/setDepositAllowed";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeSetRedeemUnderlyingAllowed from "./effects/setRedeemUnderlyingAllowed";
import shouldBehaveLikeSetRepayBorrowAllowed from "./effects/setRepayBorrowAllowed";
import shouldBehaveLikeSetSupplyUnderlyingAllowed from "./effects/setSupplyUnderlyingAllowed";

import shouldBehaveLikeBondGetter from "./view/bond";
import shouldBehaveLikeBorrowAllowedGetter from "./view/borrowAllowed";
import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeDepositCollateralAllowed from "./view/depositCollateralAllowed";
import shouldBehaveLikeIsFintrollerGetter from "./view/isFintroller";
import shouldBehaveLikeOracleGetter from "./view/oracle";
import shouldBehaveLikeRedeemUnderlyingAllowedGetter from "./view/redeemUnderlyingAllowed";
import shouldBehaveLikeRepayBorrowAllowedGetter from "./view/repayBorrowAllowed";
import shouldBehaveLikeSupplyUnderlyingAllowedGetter from "./view/supplyUnderlyingAllowed";

export function shouldBehaveLikeFintroller(): void {
  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond();
    });

    describe("setCollateralizationRatio", function () {
      shouldBehaveLikeSetCollateralizationRatio();
    });

    describe("setDepositAllowed", function () {
      shouldBehaveLikeSetDepositAllowed();
    });

    describe("setBorrowAllowed", function () {
      shouldBehaveLikeSetBorrowAllowed();
    });

    describe("setOracle", function () {
      shouldBehaveLikeSetOracle();
    });

    describe("setRedeemUnderlyingAllowed", function () {
      shouldBehaveLikeSetRedeemUnderlyingAllowed();
    });

    describe("setRepayBorrowAllowed", function () {
      shouldBehaveLikeSetRepayBorrowAllowed();
    });

    describe("setSupplyUnderlyingAllowed", function () {
      shouldBehaveLikeSetSupplyUnderlyingAllowed();
    });
  });

  describe("View Functions", function () {
    describe("bond", function () {
      shouldBehaveLikeBondGetter();
    });

    describe("borrowAllowed", function () {
      shouldBehaveLikeBorrowAllowedGetter();
    });

    describe("collateralizationRatioLowerBoundMantissa", function () {
      shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter();
    });

    describe("collateralizationRatioUpperBoundMantissa", function () {
      shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter();
    });

    describe("defaultCollateralizationRatioMantissa", function () {
      shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter();
    });

    describe("depositCollateralAllowed", function () {
      shouldBehaveLikeDepositCollateralAllowed();
    });

    describe("isFintroller", function () {
      shouldBehaveLikeIsFintrollerGetter();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });

    describe("redeemUnderlyingAllowed", function () {
      shouldBehaveLikeRedeemUnderlyingAllowedGetter();
    });

    describe("repayBorrowAllowed", function () {
      shouldBehaveLikeRepayBorrowAllowedGetter();
    });

    describe("supplyUnderlyingAllowed", function () {
      shouldBehaveLikeSupplyUnderlyingAllowedGetter();
    });
  });
}
