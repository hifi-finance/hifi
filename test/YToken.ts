import chai from "chai";
import { Wallet } from "@ethersproject/wallet";
import { deployContract, solidity } from "ethereum-waffle";
import { ethers } from "@nomiclabs/buidler";

import YTokenArtifact from "../artifacts/YToken.json";

import { YToken } from "../typechain/YToken";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

chai.use(solidity);

setTimeout(async function () {
  const wallets = (await ethers.getSigners()) as Wallet[];

  describe("YToken", function () {
    beforeEach(async function () {
      /* TODO: deploy DAI */
      /* TODO: deploy guarantor pool */

      const name: string = "DAI/ETH (2021-01-01)";
      const symbol: string = "yDAI-JAN21";
      const decimals: number = 18;
      const underlying: string = "0x6B175474E89094C44Da98b954EedeAC495271d0F"; // DAI
      const collateral: string = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"; // WETH
      const guarantorPool: string = "0x0000000000000000000000000000000000000000";
      const expirationTime: number = 1609459199; // December 31, 2020 at 23:59:59
      this.yToken = (await deployContract(wallets[0], YTokenArtifact, [
        name,
        symbol,
        decimals,
        underlying,
        collateral,
        guarantorPool,
        expirationTime,
      ])) as YToken;
    });

    shouldBehaveLikeYToken(wallets);
  });

  run();
}, 1000);
