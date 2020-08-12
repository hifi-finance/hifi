import { Wallet } from "@ethersproject/wallet";

import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeDepositCollateral from "./effects/depositCollateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeMint from "./effects/mint";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";
import shouldBehaveLikeVaultGetter from "./view/vault";

export function shouldBehaveLikeYToken(wallets: Wallet[]): void {
  const admin: Wallet = wallets[0];
  const bob: Wallet = wallets[1];
  const _grace: Wallet = wallets[2];
  const _lucy: Wallet = wallets[3];
  const eve: Wallet = wallets[4];

  describe("Effects Functions", function () {
    describe("depositCollateral", function () {
      shouldBehaveLikeDepositCollateral(admin, bob, eve);
    });

    describe("mint", function () {
      shouldBehaveLikeMint(admin, bob, eve);
    });
  });

  describe("View Functions", function () {
    describe("collateral", function () {
      shouldBehaveLikeCollateralGetter();
    });

    describe("expirationTime", function () {
      shouldBehaveLikeExpirationTimeGetter();
    });

    describe("fintroller", function () {
      shouldBehaveLikeFintrollerGetter();
    });

    describe("guarantorPool", function () {
      shouldBehaveLikeGuarantorPoolGetter();
    });

    describe("underlying", function () {
      shouldBehaveLikeUnderlyingGetter();
    });

    describe("vault", function () {
      shouldBehaveLikeVaultGetter(bob);
    });
  });
}
