import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeGetBond from "./view/getBond";
import shouldBehaveLikeGetBondCollateralizationRatio from "./view/getBondCollateralizationRatio";
import shouldBehaveLikeGetBondDebtCeiling from "./view/getBondDebtCeiling";
import shouldBehaveLikeGetBorrowAllowed from "./view/getBorrowAllowed";
import shouldBehaveLikeGetDepositCollateralAllowed from "./view/getDepositCollateralAllowed";
import shouldBehaveLikeGetRedeemUnderlyingAllowed from "./view/getRedeemUnderlyingAllowed";
import shouldBehaveLikeGetRepayBorrowAllowed from "./view/getRepayBorrowAllowed";
import shouldBehaveLikeGetSupplyUnderlyingAllowed from "./view/getSupplyUnderlyingAllowed";
import shouldBehaveLikeIsFintrollerGetter from "./view/isFintroller";
import shouldBehaveLikeOracleGetter from "./view/oracle";
import shouldBehaveLikeOraclePricePrecisionScalarGetter from "./view/oraclePricePrecisionScalar";

import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDebtCeiling from "./effects/setDebtCeiling";
import shouldBehaveLikeSetDepositCollateralAllowed from "./effects/setDepositCollateralAllowed";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeSetRedeemUnderlyingAllowed from "./effects/setRedeemUnderlyingAllowed";
import shouldBehaveLikeSetRepayBorrowAllowed from "./effects/setRepayBorrowAllowed";
import shouldBehaveLikeSetSupplyUnderlyingAllowed from "./effects/setSupplyUnderlyingAllowed";

export function shouldBehaveLikeFintroller(): void {
  describe("View Functions", function () {
    describe("collateralizationRatioLowerBoundMantissa", function () {
      shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter();
    });

    describe("collateralizationRatioUpperBoundMantissa", function () {
      shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter();
    });

    describe("defaultCollateralizationRatioMantissa", function () {
      shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter();
    });

    describe("getBond", function () {
      shouldBehaveLikeGetBond();
    });

    describe("getBondCollateralizationRatio", function () {
      shouldBehaveLikeGetBondCollateralizationRatio();
    });

    describe("getBondDebtCeiling", function () {
      shouldBehaveLikeGetBondDebtCeiling();
    });

    describe("getBorrowAllowed", function () {
      shouldBehaveLikeGetBorrowAllowed();
    });

    describe("getDepositCollateralAllowed", function () {
      shouldBehaveLikeGetDepositCollateralAllowed();
    });

    describe("getRedeemUnderlyingAllowed", function () {
      shouldBehaveLikeGetRedeemUnderlyingAllowed();
    });

    describe("getRepayBorrowAllowed", function () {
      shouldBehaveLikeGetRepayBorrowAllowed();
    });

    describe("getSupplyUnderlyingAllowed", function () {
      shouldBehaveLikeGetSupplyUnderlyingAllowed();
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

    describe("setDebtCeiling", function () {
      shouldBehaveLikeSetDebtCeiling();
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
