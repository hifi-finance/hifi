import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDepositCollateralAllowed from "./effects/setDepositCollateralAllowed";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeSetRedeemUnderlyingAllowed from "./effects/setRedeemUnderlyingAllowed";
import shouldBehaveLikeSetRepayBorrowAllowed from "./effects/setRepayBorrowAllowed";
import shouldBehaveLikeSetSupplyUnderlyingAllowed from "./effects/setSupplyUnderlyingAllowed";

import shouldBehaveLikeBorrowAllowed from "./view/borrowAllowed";
import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeDepositCollateralAllowed from "./view/depositCollateralAllowed";
import shouldBehaveLikeGetBond from "./view/getBond";
import shouldBehaveLikeGetBondThresholdCollateralizationRatio from "./view/getBondThresholdCollateralizationRatio";
import shouldBehaveLikeIsFintrollerGetter from "./view/isFintroller";
import shouldBehaveLikeOracleGetter from "./view/oracle";
import shouldBehaveLikeOraclePricePrecisionScalarGetter from "./view/oraclePricePrecisionScalar";
import shouldBehaveLikeRedeemUnderlyingAllowed from "./view/redeemUnderlyingAllowed";
import shouldBehaveLikeRepayBorrowAllowed from "./view/repayBorrowAllowed";
import shouldBehaveLikeSupplyUnderlyingAllowed from "./view/supplyUnderlyingAllowed";

export function shouldBehaveLikeFintroller(): void {
  describe("View Functions", function () {
    describe("borrowAllowed", function () {
      shouldBehaveLikeBorrowAllowed();
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

    describe("getBond", function () {
      shouldBehaveLikeGetBond();
    });

    describe("getBondThresholdCollateralizationRatio", function () {
      shouldBehaveLikeGetBondThresholdCollateralizationRatio();
    });

    describe("isFintroller", function () {
      shouldBehaveLikeIsFintrollerGetter();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });

    describe("oraclePricePrecisionScalar", function () {
      shouldBehaveLikeOraclePricePrecisionScalarGetter();
    });

    describe("redeemUnderlyingAllowed", function () {
      shouldBehaveLikeRedeemUnderlyingAllowed();
    });

    describe("repayBorrowAllowed", function () {
      shouldBehaveLikeRepayBorrowAllowed();
    });

    describe("supplyUnderlyingAllowed", function () {
      shouldBehaveLikeSupplyUnderlyingAllowed();
    });
  });

  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond();
    });

    describe("setBorrowAllowed", function () {
      shouldBehaveLikeSetBorrowAllowed();
    });

    describe("setCollateralizationRatio", function () {
      shouldBehaveLikeSetCollateralizationRatio();
    });

    describe("setDepositCollateralAllowed", function () {
      shouldBehaveLikeSetDepositCollateralAllowed();
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
}
