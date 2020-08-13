import { Signer } from "@ethersproject/abstract-signer";

import { OneThousandTokens, TenTokens } from "../../constants";
import { deployFintroller, deploySuperMinter, deployYToken, deployOracle } from "../deployers";
import { mintAndDistributeTokens } from "../minters";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

export function testYToken(): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const deployer: Signer = this.admin;
      await deployFintroller.call(this, deployer);
      await deployOracle.call(this, deployer);
      /* TODO: handle the case when the oracle isn't set. */
      await this.fintroller.connect(deployer).setOracle(this.oracle.address);
      await deployYToken.call(this, deployer);
      await deploySuperMinter.call(this, deployer);

      const signers: Signer[] = [this.admin, this.brad, this.eve, this.grace, this.lucy];
      /* Give all wallets 10 WETH */
      await mintAndDistributeTokens.call(this, this.collateral, TenTokens, signers);
      /* Give all wallets 1,000 DAI */
      await mintAndDistributeTokens.call(this, this.underlying, OneThousandTokens, signers);
    });

    shouldBehaveLikeYToken();
  });
}
