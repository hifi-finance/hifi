import shouldBehaveLikeSetOracle from "./effects/setOracle";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGetBondList from "./view/getBondList";
import shouldBehaveLikeGetCollateralList from "./view/getCollateralList";
import shouldBehaveLikeGetCurrentAccountLiquidity from "./view/getCurrentAccountLiquidity";
import shouldBehaveLikeGetHypotheticalAccountLiquidity from "./view/getHypotheticalAccountLiquidity";
import shouldBehaveLikeOracleGetter from "./view/oracle";

export function shouldBehaveLikeBalanceSheet(): void {
  describe("View Functions", function () {
    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("getBondList", function () {
      shouldBehaveLikeGetBondList();
    });

    describe("getCollateralList", function () {
      shouldBehaveLikeGetCollateralList();
    });

    describe("getCurrentAccountLiquidity", function () {
      shouldBehaveLikeGetCurrentAccountLiquidity();
    });

    describe("getHypotheticalAccountLiquidity", function () {
      shouldBehaveLikeGetHypotheticalAccountLiquidity();
    });

    describe("oracle", function () {
      shouldBehaveLikeOracleGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("setOracle", function () {
      shouldBehaveLikeSetOracle();
    });
  });
}
