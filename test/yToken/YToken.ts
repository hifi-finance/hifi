import chai from "chai";
import { Wallet } from "@ethersproject/wallet";
import { deployContract, solidity } from "ethereum-waffle";
import { ethers } from "@nomiclabs/buidler";

import Erc20Artifact from "../../artifacts/Erc20.json";
import GuarantorPoolArtifact from "../../artifacts/GuarantorPool.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import scenarios from "../scenarios";
import { Erc20 } from "../../typechain/Erc20";
import { GuarantorPool } from "../../typechain/GuarantorPool";
import { YToken } from "../../typechain/YToken";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

chai.use(solidity);

setTimeout(async function () {
  const wallets = (await ethers.getSigners()) as Wallet[];

  describe("YToken", function () {
    beforeEach(async function () {
      const deployer: Wallet = wallets[0];
      this.scenario = scenarios.default;

      this.underlying = (await deployContract(deployer, Erc20Artifact, [
        this.scenario.underlying.name,
        this.scenario.underlying.symbol,
        this.scenario.underlying.decimals,
      ])) as Erc20;

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

      const underlying: string = this.underlying.address;
      const collateral: string = this.collateral.address;
      const guarantorPool: string = this.guarantorPool.address;
      this.yToken = (await deployContract(deployer, YTokenArtifact, [
        this.scenario.yToken.name,
        this.scenario.yToken.symbol,
        this.scenario.yToken.decimals,
        underlying,
        collateral,
        guarantorPool,
        this.scenario.yToken.expirationTime,
      ])) as YToken;
    });

    shouldBehaveLikeYToken(wallets);
  });

  run();
}, 1000);
