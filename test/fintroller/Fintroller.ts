import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

import { deployFintroller, deployYToken } from "../deployers";

export function testFintroller(wallets: Wallet[]): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      await deployFintroller.call(this, deployer);
      await deployYToken.call(this, deployer);
    });

    shouldBehaveLikeFintroller(wallets);
  });
}
