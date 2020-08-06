import { Wallet } from "@ethersproject/wallet";

import { OneHundredTokens } from "../../constants";
import { deployFintroller, deploySuperMinter, deployYToken } from "../deployers";
import { mintAndDistributeUnderlyingTokens } from "../minters";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

export function testYToken(wallets: Wallet[]): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      await deployFintroller.call(this, deployer);
      await deployYToken.call(this, deployer);

      await deploySuperMinter.call(this, deployer);

      await mintAndDistributeUnderlyingTokens.call(this, OneHundredTokens, wallets);
    });

    shouldBehaveLikeYToken(wallets);
  });
}
