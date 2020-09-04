import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDepositAllowed from "./effects/setDepositAllowed";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";

import shouldBehaveLikeBondGetter from "./view/bond";
import shouldBehaveLikeBorrowAllowed from "./view/borrowAllowed";
import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeIsFintrollerGetter from "./view/isFintroller";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeDepositCollateralAllowed from "./view/depositCollateralAllowed";
import shouldBehaveLikeOracleGetter from "./view/oracle";

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
  });

  describe("View Functions", function () {
    describe("bond", function () {
      shouldBehaveLikeBondGetter();
    });

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

    describe("isFintroller", function () {
      shouldBehaveLikeIsFintrollerGetter();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });
  });
}
