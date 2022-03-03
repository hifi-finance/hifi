import { shouldBehaveLikeListBond } from "./effects/listBond";
import { shouldBehaveLikeListCollateral } from "./effects/listCollateral";
import { shouldBehaveLikeSetBorrowAllowed } from "./effects/setBorrowAllowed";
import { shouldBehaveLikeSetCollateralCeiling } from "./effects/setCollateralCeiling";
import { shouldBehaveLikeSetCollateralRatio } from "./effects/setCollateralRatio";
import { shouldBehaveLikeSetDebtCeiling } from "./effects/setDebtCeiling";
import { shouldBehaveLikeSetDepositCollateralAllowed } from "./effects/setDepositCollateralAllowed";
import { shouldBehaveLikeSetDepositUnderlyingAllowed } from "./effects/setDepositUnderlyingAllowed";
import { shouldBehaveLikeSetLiquidateBorrowAllowed } from "./effects/setLiquidateBorrowAllowed";
import { shouldBehaveLikeSetLiquidationIncentive } from "./effects/setLiquidationIncentive";
import { shouldBehaveLikeSetMaxBonds } from "./effects/setMaxBonds";
import { shouldBehaveLikeSetRepayBorrowAllowed } from "./effects/setRepayBorrowAllowed";
import { shouldBehaveLikeGetBond } from "./view/getBond";
import { shouldBehaveLikeGetBorrowAllowed } from "./view/getBorrowAllowed";
import { shouldBehaveLikeGetCollateral } from "./view/getCollateral";
import { shouldBehaveLikeGetCollateralCeiling } from "./view/getCollateralCeiling";
import { shouldBehaveLikeGetCollateralRatio } from "./view/getCollateralRatio";
import { shouldBehaveLikeGetDebtCeiling } from "./view/getDebtCeiling";
import { shouldBehaveLikeGetDepositCollateralAllowed } from "./view/getDepositCollateralAllowed";
import { shouldBehaveLikeGetDepositUnderlyingAllowed } from "./view/getDepositUnderlyingAllowed";
import { shouldBehaveLikeGetLiquidateBorrowAllowed } from "./view/getLiquidateBorrowAllowed";
import { shouldBehaveLikeGetLiquidationIncentive } from "./view/getLiquidationIncentive";
import { shouldBehaveLikeGetRepayBorrowAllowed } from "./view/getRepayBorrowAllowed";
import { shouldBehaveLikeIsBondListed } from "./view/isBondListed";
import { shouldBehaveLikeIsCollateralListed } from "./view/isCollateralListed";
import { shouldBehaveLikeMaxBonds } from "./view/maxBonds";

export function shouldBehaveLikeFintroller(): void {
  describe("View Functions", function () {
    describe("getBond", function () {
      shouldBehaveLikeGetBond();
    });

    describe("getBorrowAllowed", function () {
      shouldBehaveLikeGetBorrowAllowed();
    });

    describe("getCollateral", function () {
      shouldBehaveLikeGetCollateral();
    });

    describe("getCollateralCeiling", function () {
      shouldBehaveLikeGetCollateralCeiling();
    });

    describe("getCollateralRatio", function () {
      shouldBehaveLikeGetCollateralRatio();
    });

    describe("getDebtCeiling", function () {
      shouldBehaveLikeGetDebtCeiling();
    });

    describe("getDepositCollateralAllowed", function () {
      shouldBehaveLikeGetDepositCollateralAllowed();
    });

    describe("getDepositUnderlyingAllowed", function () {
      shouldBehaveLikeGetDepositUnderlyingAllowed();
    });

    describe("getLiquidateBorrowAllowed", function () {
      shouldBehaveLikeGetLiquidateBorrowAllowed();
    });

    describe("getLiquidationIncentive", function () {
      shouldBehaveLikeGetLiquidationIncentive();
    });

    describe("getRepayBorrowAllowed", function () {
      shouldBehaveLikeGetRepayBorrowAllowed();
    });

    describe("isBondListed", function () {
      shouldBehaveLikeIsBondListed();
    });

    describe("isCollateralListed", function () {
      shouldBehaveLikeIsCollateralListed();
    });

    describe("maxBonds", function () {
      shouldBehaveLikeMaxBonds();
    });
  });

  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond();
    });

    describe("listCollateral", function () {
      shouldBehaveLikeListCollateral();
    });

    describe("setBorrowAllowed", function () {
      shouldBehaveLikeSetBorrowAllowed();
    });

    describe("setCollateralCeiling", function () {
      shouldBehaveLikeSetCollateralCeiling();
    });

    describe("setCollateralRatio", function () {
      shouldBehaveLikeSetCollateralRatio();
    });

    describe("setDebtCeiling", function () {
      shouldBehaveLikeSetDebtCeiling();
    });

    describe("setDepositCollateralAllowed", function () {
      shouldBehaveLikeSetDepositCollateralAllowed();
    });

    describe("setDepositUnderlyingAllowed", function () {
      shouldBehaveLikeSetDepositUnderlyingAllowed();
    });

    describe("setLiquidateBorrowAllowed", function () {
      shouldBehaveLikeSetLiquidateBorrowAllowed();
    });

    describe("setLiquidationIncentive", function () {
      shouldBehaveLikeSetLiquidationIncentive();
    });

    describe("setMaxBonds", function () {
      shouldBehaveLikeSetMaxBonds();
    });

    describe("setRepayBorrowAllowed", function () {
      shouldBehaveLikeSetRepayBorrowAllowed();
    });
  });
}
