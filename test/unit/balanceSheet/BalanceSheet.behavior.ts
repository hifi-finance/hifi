import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGetCurrentCollateralizationRatio from "./view/getCurrentCollateralizationRatio";
import shouldBehaveLikeGetHypotheticalCollateralizationRatio from "./view/getHypotheticalCollateralizationRatio";
import shouldBehaveLikeGetVault from "./view/getVault";
import shouldBehaveLikeGetVaultDebt from "./view/getVaultDebt";
import shouldBehaveLikeGetVaultLockedCollateral from "./view/getVaultLockedCollateral";
import shouldBehaveLikeIsAccountUnderwater from "./view/isAccountUnderwater";
import shouldBehaveLikeIsBalanceSheetGetter from "./view/isBalanceSheet";
import shouldBehaveLikeIsVaultOpenGetter from "./view/isVaultOpen";

import shouldBehaveLikeClutchCollateral from "./effects/clutchCollateral";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeFreeCollateral from "./effects/freeCollateral";
import shouldBehaveLikeGetClutchableCollateral from "./view/getClutchableCollateral";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeOpenVault from "./effects/openVault";
import shouldBehaveLikeSetVaultDebt from "./effects/setVaultDebt";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";

export function shouldBehaveLikeBalanceSheet(): void {
  describe("View Functions", function () {
    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("getClutchableCollateral", function () {
      shouldBehaveLikeGetClutchableCollateral();
    });

    describe("getCurrentCollateralizationRatio", function () {
      shouldBehaveLikeGetCurrentCollateralizationRatio();
    });

    describe("getHypotheticalCollateralizationRatio", function () {
      shouldBehaveLikeGetHypotheticalCollateralizationRatio();
    });

    describe("getVault", function () {
      shouldBehaveLikeGetVault();
    });

    describe("getVaultDebt", function () {
      shouldBehaveLikeGetVaultDebt();
    });

    describe("getVaultLockedCollateral", function () {
      shouldBehaveLikeGetVaultLockedCollateral();
    });

    describe("isAccountUnderwater", function () {
      shouldBehaveLikeIsAccountUnderwater();
    });

    describe("isBalanceSheet", function () {
      shouldBehaveLikeIsBalanceSheetGetter();
    });

    describe("isVaultOpen", function () {
      shouldBehaveLikeIsVaultOpenGetter();
    });
  });

  describe("Effects Functions", function () {
    describe("clutchCollateral", function () {
      shouldBehaveLikeClutchCollateral();
    });

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

    describe("setVaultDebt", function () {
      shouldBehaveLikeSetVaultDebt();
    });

    describe("withdrawCollateral", function () {
      shouldBehaveLikeWithdrawCollateral();
    });
  });
}
