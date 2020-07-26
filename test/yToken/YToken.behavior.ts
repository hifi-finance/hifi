import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeYTokenStorage } from "./YTokenStorage.behavior";

export function shouldBehaveLikeYToken(_wallets: Wallet[]): void {
  describe("YTokenStorage", function () {
    shouldBehaveLikeYTokenStorage();
  });
}
