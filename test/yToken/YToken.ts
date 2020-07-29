import chai from "chai";
import { Wallet } from "@ethersproject/wallet";
import { deployContract, solidity } from "ethereum-waffle";

import Erc20Artifact from "../../artifacts/Erc20.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import GuarantorPoolArtifact from "../../artifacts/GuarantorPool.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import scenarios from "../scenarios";
import { Erc20 } from "../../typechain/Erc20";
import { Fintroller } from "../../typechain/Fintroller";
import { GuarantorPool } from "../../typechain/GuarantorPool";
import { YToken } from "../../typechain/YToken";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

chai.use(solidity);

export function testYToken(wallets: Wallet[]): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      this.scenario = scenarios.default;

      this.underlying = (await deployContract(deployer, Erc20Artifact, [
        this.scenario.underlying.name,
        this.scenario.underlying.symbol,
        this.scenario.underlying.decimals,
      ])) as Erc20;

      const decimals: number = 18;
      const name: string = "My Token";
      const symbol: string = "TKN";
      this.token = (await deployContract(deployer, Erc20Artifact, [name, symbol, decimals])) as Erc20;

      this.collateral = (await deployContract(deployer, Erc20Artifact, [
        this.scenario.collateral.name,
        this.scenario.collateral.symbol,
        this.scenario.collateral.decimals,
      ])) as Erc20;

      this.guarantorPool = (await deployContract(deployer, GuarantorPoolArtifact, [
        this.scenario.guarantorPool.name,
        this.scenario.guarantorPool.symbol,
        this.scenario.guarantorPool.decimals,
      ])) as GuarantorPool;

      this.fintroller = (await deployContract(deployer, FintrollerArtifact, [])) as Fintroller;

      this.yToken = (await deployContract(deployer, YTokenArtifact, [
        this.scenario.yToken.name,
        this.scenario.yToken.symbol,
        this.scenario.yToken.decimals,
        this.fintroller.address,
        this.underlying.address,
        this.collateral.address,
        this.guarantorPool.address,
        this.scenario.yToken.expirationTime,
      ])) as YToken;
    });

    shouldBehaveLikeYToken(wallets);
  });
}
