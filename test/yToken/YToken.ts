import { Wallet } from "@ethersproject/wallet";

import { shouldBehaveLikeYToken } from "./YToken.behavior";

import { deployFintroller, deployYToken } from "../deployers";

export function testYToken(wallets: Wallet[]): void {
  describe("YToken Tests", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      await deployFintroller.call(this, deployer);
      await deployYToken.call(this, deployer);
    });

    shouldBehaveLikeYToken(wallets);
  });
}
