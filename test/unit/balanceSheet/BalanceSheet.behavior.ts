import shouldBehaveLikeBorrow from "./effects/borrow";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeRepayBorrow from "./effects/repayBorrow";
import shouldBehaveLikeRepayBorrowBehalf from "./effects/repayBorrowBehalf";
import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGetBondList from "./view/getBondList";
import shouldBehaveLikeGetCollateralAmount from "./view/getCollateralAmount";
import shouldBehaveLikeGetCollateralList from "./view/getCollateralList";
import shouldBehaveLikeGetCurrentAccountLiquidity from "./view/getCurrentAccountLiquidity";
import shouldBehaveLikeGetDebtAmount from "./view/getDebtAmount";
import shouldBehaveLikeGetHypotheticalAccountLiquidity from "./view/getHypotheticalAccountLiquidity";
import shouldBehaveLikeGetSeizableCollateralAmount from "./view/getSeizableCollateralAmount";
import shouldBehaveLikeOracleGetter from "./view/oracle";

export function shouldBehaveLikeBalanceSheet(): void {
  describe("View Functions", function () {
    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("getBondList", function () {
      shouldBehaveLikeGetBondList();
    });

    describe("getCollateralAmount", function () {
      shouldBehaveLikeGetCollateralAmount();
    });

    describe("getCollateralList", function () {
      shouldBehaveLikeGetCollateralList();
    });

    describe("getCurrentAccountLiquidity", function () {
      shouldBehaveLikeGetCurrentAccountLiquidity();
    });

    describe("getDebtAmount", function () {
      shouldBehaveLikeGetDebtAmount();
    });

    describe("getHypotheticalAccountLiquidity", function () {
      shouldBehaveLikeGetHypotheticalAccountLiquidity();
    });

    describe("getSeizableCollateralAmount", function () {
      shouldBehaveLikeGetSeizableCollateralAmount();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("borrow", function () {
      shouldBehaveLikeBorrow();
    });

    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });

    describe("repayBorrow", function () {
      shouldBehaveLikeRepayBorrow();
    });

    describe("repayBorrowBehalf", function () {
      shouldBehaveLikeRepayBorrowBehalf();
    });

    describe("setOracle", function () {
      shouldBehaveLikeSetOracle();
    });

    describe("withdrawCollateral", function () {
      shouldBehaveLikeWithdrawCollateral();
    });
  });
}
