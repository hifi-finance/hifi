import { Wallet } from "@ethersproject/wallet";

import shouldBehaveLikeBondGetter from "./view/bond";
import shouldBehaveLikeCollateralizationRatioLowerBoundMantissaGetter from "./view/collateralizationRatioLowerBoundMantissa";
import shouldBehaveLikeCollateralizationRatioUpperBoundMantissaGetter from "./view/collateralizationRatioUpperBoundMantissa";
import shouldBehaveLikeDefaultCollateralizationRatioMantissaGetter from "./view/defaultCollateralizationRatioMantissa";
import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeOracleGetter from "./view/oracle";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetOracle from "./effects/setOracle";

export function shouldBehaveLikeFintroller(wallets: Wallet[]): void {
  const admin: Wallet = wallets[0];
  const _bob: Wallet = wallets[1];
  const _grace: Wallet = wallets[2];
  const _lucy: Wallet = wallets[3];
  const eve: Wallet = wallets[4];

  describe("Effects Functions", function () {
    describe("listBond", function () {
      shouldBehaveLikeListBond(admin);
    });

    describe("setCollateralizationRatio", function () {
      shouldBehaveLikeSetCollateralizationRatio(admin, eve);
    });

    describe("setOracle", function () {
      shouldBehaveLikeSetOracle(admin, eve);
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
