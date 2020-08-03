import { Wallet } from "@ethersproject/wallet";

import shouldBehaveLikeCollateralGetter from "./view/collateral";
import shouldBehaveLikeExpirationTimeGetter from "./view/expirationTime";
import shouldBehaveLikeFintrollerGetter from "./view/fintroller";
import shouldBehaveLikeGuarantorPoolGetter from "./view/guarantorPool";
import shouldBehaveLikeUnderlyingGetter from "./view/underlying";

export function shouldBehaveLikeYToken(wallets: Wallet[]): void {
  describe("View Functions", function () {
    describe("collateral", function () {
      shouldBehaveLikeCollateralGetter();
    });

    describe("expiratonTime", function () {
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
  });
}
