import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetBondCollateralizationRatio from "./effects/setBondCollateralizationRatio";
import shouldBehaveLikeSetBondDebtCeiling from "./effects/setBondDebtCeiling";
import shouldBehaveLikeSetBondLiquidationIncentive from "./effects/setBondLiquidationIncentive";
import shouldBehaveLikeSetBorrowAllowed from "./effects/setBorrowAllowed";
import shouldBehaveLikeSetDepositCollateralAllowed from "./effects/setDepositCollateralAllowed";
import shouldBehaveLikeSetLiquidateBorrowAllowed from "./effects/setLiquidateBorrowAllowed";
import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeSetRedeemHTokensAllowed from "./effects/setRedeemHTokensAllowed";
import shouldBehaveLikeSetRepayBorrowAllowed from "./effects/setRepayBorrowAllowed";
import shouldBehaveLikeSetSupplyUnderlyingAllowed from "./effects/setSupplyUnderlyingAllowed";
import shouldBehaveLikeGetBond from "./view/getBond";
import shouldBehaveLikeGetBondCollateralizationRatio from "./view/getBondCollateralizationRatio";
import shouldBehaveLikeGetBondDebtCeiling from "./view/getBondDebtCeiling";
import shouldBehaveLikeGetBondLiquidationIncentive from "./view/getBondLiquidationIncentive";
import shouldBehaveLikeGetBorrowAllowed from "./view/getBorrowAllowed";
import shouldBehaveLikeGetDepositCollateralAllowed from "./view/getDepositCollateralAllowed";
import shouldBehaveLikeGetLiquidateBorrowAllowed from "./view/getLiquidateBorrowAllowed";
import shouldBehaveLikeGetRedeemHTokensAllowed from "./view/getRedeemHTokensAllowed";
import shouldBehaveLikeGetRepayBorrowAllowed from "./view/getRepayBorrowAllowed";
import shouldBehaveLikeGetSupplyUnderlyingAllowed from "./view/getSupplyUnderlyingAllowed";
import shouldBehaveLikeIsBondListed from "./view/isBondListed";
import shouldBehaveLikeIsFintrollerGetter from "./view/isFintroller";
import shouldBehaveLikeOracleGetter from "./view/oracle";

export function shouldBehaveLikeFintroller(): void {
  describe("View Functions", function () {
    describe("getBond", function () {
      shouldBehaveLikeGetBond();
    });

    describe("getBondCollateralizationRatio", function () {
      shouldBehaveLikeGetBondCollateralizationRatio();
    });

    describe("getBondDebtCeiling", function () {
      shouldBehaveLikeGetBondDebtCeiling();
    });

    describe("getBondLiquidationIncentive", function () {
      shouldBehaveLikeGetBondLiquidationIncentive();
    });

    describe("getBorrowAllowed", function () {
      shouldBehaveLikeGetBorrowAllowed();
    });

    describe("getDepositCollateralAllowed", function () {
      shouldBehaveLikeGetDepositCollateralAllowed();
    });

    describe("getLiquidateBorrowAllowed", function () {
      shouldBehaveLikeGetLiquidateBorrowAllowed();
    });

    describe("getRedeemHTokensAllowed", function () {
      shouldBehaveLikeGetRedeemHTokensAllowed();
    });

    describe("getRepayBorrowAllowed", function () {
      shouldBehaveLikeGetRepayBorrowAllowed();
    });

    describe("getSupplyUnderlyingAllowed", function () {
      shouldBehaveLikeGetSupplyUnderlyingAllowed();
    });

    describe("isBondListed", function () {
      shouldBehaveLikeIsBondListed();
    });

    describe("isFintroller", function () {
      shouldBehaveLikeIsFintrollerGetter();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond();
    });

    describe("setBondCollateralizationRatio", function () {
      shouldBehaveLikeSetBondCollateralizationRatio();
    });

    describe("setBondDebtCeiling", function () {
      shouldBehaveLikeSetBondDebtCeiling();
    });

    describe("setBorrowAllowed", function () {
      shouldBehaveLikeSetBorrowAllowed();
    });

    describe("setDepositCollateralAllowed", function () {
      shouldBehaveLikeSetDepositCollateralAllowed();
    });

    describe("setLiquidateBorrowAllowed", function () {
      shouldBehaveLikeSetLiquidateBorrowAllowed();
    });

    describe("setBondLiquidationIncentive", function () {
      shouldBehaveLikeSetBondLiquidationIncentive();
    });

    describe("setOracle", function () {
      shouldBehaveLikeSetOracle();
    });

    describe("setRedeemHTokensAllowed", function () {
      shouldBehaveLikeSetRedeemHTokensAllowed();
    });

    describe("setRepayBorrowAllowed", function () {
      shouldBehaveLikeSetRepayBorrowAllowed();
    });

    describe("setSupplyUnderlyingAllowed", function () {
      shouldBehaveLikeSetSupplyUnderlyingAllowed();
    });
  });
}
