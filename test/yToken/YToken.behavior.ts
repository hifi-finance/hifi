import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeYTokenStorage } from "./YTokenStorage.behavior";

export function shouldBehaveLikeYToken(wallets: Wallet[]): void {
  describe("YTokenStorage", function () {
    shouldBehaveLikeYTokenStorage(wallets);
  });
}
