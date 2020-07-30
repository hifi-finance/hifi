import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeFintrollerStorage } from "./FintrollerStorage.behavior";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";

export function shouldBehaveLikeFintroller(wallets: Wallet[]): void {
  const admin: Wallet = wallets[0];
  const _bob: Wallet = wallets[1];
  const _grace: Wallet = wallets[2];
  const _lucy: Wallet = wallets[3];
  const eve: Wallet = wallets[4];

  describe("Fintroller", function() {
    describe("setCollateralizationRatio", function() {
      shouldBehaveLikeSetCollateralizationRatio(admin, eve);
    });
  });

  describe("FintrollerStorage", function () {
    shouldBehaveLikeFintrollerStorage(wallets);
  });
}
