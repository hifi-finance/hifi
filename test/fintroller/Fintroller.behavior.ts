import shouldBehaveLikeBondGetter from "./view/bond";
import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeOracleGetter from "./view/oracle";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetDepositAllowed from "./effects/setDepositAllowed";
import shouldBehaveLikeSetMintAllowed from "./effects/setMintAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";

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

    describe("setMintAllowed", function () {
      shouldBehaveLikeSetMintAllowed();
    });

    describe("setOracle", function () {
      shouldBehaveLikeSetOracle();
    });
  });

  describe("View Functions", function () {
    describe("bond", function () {
      shouldBehaveLikeBondGetter();
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

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });
  });
}
