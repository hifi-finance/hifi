import { Wallet } from "@ethersproject/wallet";

import shouldBehaveLikeListBond from "./effects/listBond";
import shouldBehaveLikeSetCollateralizationRatio from "./effects/setCollateralizationRatio";
import shouldBehaveLikeSetOracle from "./effects/setOracle";

export function shouldBehaveLikeFintroller(wallets: Wallet[]): void {
  const admin: Wallet = wallets[0];
  const _bob: Wallet = wallets[1];
  const _grace: Wallet = wallets[2];
  const _lucy: Wallet = wallets[3];
  const eve: Wallet = wallets[4];

  describe("listBond", function () {
    shouldBehaveLikeListBond();
  });

  describe("setCollateralizationRatio", function () {
    shouldBehaveLikeSetCollateralizationRatio(admin);
  });

  describe("setOracle", function () {
    shouldBehaveLikeSetOracle(admin, eve);
  });
}
