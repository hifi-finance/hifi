import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeFreeCollateral from "./effects/freeCollateral";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeOpenVault from "./effects/openVault";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";

import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGetHypotheticalCollateralizationRatio from "./view/getHypotheticalCollateralizationRatio";
import shouldBehaveLikeGetValut from "./view/getVault";
import shouldBehaveLikeIsBalanceSheetGetter from "./view/isBalanceSheet";
import shouldBehaveLikeIsVaultOpenGetter from "./view/isVaultOpen";

export function shouldBehaveLikeBalanceSheet(): void {
  describe("Effects Functions", function () {
    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });

    describe("freeCollateral", function () {
      shouldBehaveLikeFreeCollateral();
    });

    describe("lockCollateral", function () {
      shouldBehaveLikeLockCollateral();
    });

    describe("openVault", function () {
      shouldBehaveLikeOpenVault();
    });

    describe("withdrawCollateral", function () {
      shouldBehaveLikeWithdrawCollateral();
    });
  });

  describe("View Functions", function () {
    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("getVault", function () {
      shouldBehaveLikeGetValut();
    });

    describe("getHypotheticalCollateralizationRatio", function () {
      shouldBehaveLikeGetHypotheticalCollateralizationRatio();
    });

    describe("isBalanceSheet", function () {
      shouldBehaveLikeIsBalanceSheetGetter();
    });

    describe("isVaultOpen", function () {
      shouldBehaveLikeIsVaultOpenGetter();
    });
  });
}
