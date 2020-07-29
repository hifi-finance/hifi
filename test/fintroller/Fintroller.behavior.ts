import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeFintrollerStorage } from "./FintrollerStorage.behavior";

export function shouldBehaveLikeFintroller(wallets: Wallet[]): void {
  describe("FintrollerStorage", function () {
    shouldBehaveLikeFintrollerStorage(wallets);
  });
}
