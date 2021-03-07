import shouldBehaveLikeClutchCollateral from "./effects/clutchCollateral";
import shouldBehaveLikeDecreaseVaultDebt from "./effects/decreaseVaultDebt";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeFreeCollateral from "./effects/freeCollateral";
import shouldBehaveLikeIncreaseVaultDebt from "./effects/increaseVaultDebt";
import shouldBehaveLikeLockCollateral from "./effects/lockCollateral";
import shouldBehaveLikeOpenVault from "./effects/openVault";
import shouldBehaveLikeWithdrawCollateral from "./effects/withdrawCollateral";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGetClutchableCollateral from "./view/getClutchableCollateral";
import shouldBehaveLikeGetCurrentCollateralizationRatio from "./view/getCurrentCollateralizationRatio";
import shouldBehaveLikeGetHypotheticalCollateralizationRatio from "./view/getHypotheticalCollateralizationRatio";
import shouldBehaveLikeGetVault from "./view/getVault";
import shouldBehaveLikeGetVaultDebt from "./view/getVaultDebt";
import shouldBehaveLikeGetVaultLockedCollateral from "./view/getVaultLockedCollateral";
import shouldBehaveLikeIsAccountUnderwater from "./view/isAccountUnderwater";
import shouldBehaveLikeIsBalanceSheetGetter from "./view/isBalanceSheet";
import shouldBehaveLikeIsVaultOpenGetter from "./view/isVaultOpen";

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

    describe("decreaseVaultDebt", function () {
      shouldBehaveLikeDecreaseVaultDebt();
    });

    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral();
    });

    describe("freeCollateral", function () {
      shouldBehaveLikeFreeCollateral();
    });

    describe("increaseVaultDebt", function () {
      shouldBehaveLikeIncreaseVaultDebt();
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
}
