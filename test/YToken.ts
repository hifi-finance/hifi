import chai from "chai";
import { Wallet } from "@ethersproject/wallet";
import { deployContract, solidity } from "ethereum-waffle";
import { ethers } from "@nomiclabs/buidler";

import Erc20Artifact from "../artifacts/Erc20.json";
import GuarantorPoolArtifact from "../artifacts/GuarantorPool.json";
import YTokenArtifact from "../artifacts/YToken.json";

import { Erc20 } from "../typechain/Erc20";
import { GuarantorPool } from "../typechain/GuarantorPool";
import { YToken } from "../typechain/YToken";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

chai.use(solidity);

setTimeout(async function () {
  const wallets = (await ethers.getSigners()) as Wallet[];

  describe("YToken", function () {
    beforeEach(async function () {
      const underlyingName: string = "Dai Stablecoin";
      const underlyingSymbol: string = "DAI";
      const underlyingDecimals: number = 18;
      this.underlying = (await deployContract(wallets[0], Erc20Artifact, [
        underlyingName,
        underlyingSymbol,
        underlyingDecimals,
      ])) as Erc20;

      const collateralName: string = "Wrapped Ether";
      const collateralSymbol: string = "WETH";
      const collateralDecimals: number = 18;
      this.collateral = (await deployContract(wallets[0], Erc20Artifact, [
        collateralName,
        collateralSymbol,
        collateralDecimals,
      ])) as Erc20;

      const guarantorPoolName: string = "Mainframe Guarantor Pool Shares";
      const guarantorPoolSymbol: string = "GPSHARES";
      const guarantorPoolDecimals: number = 18;
      this.guarantorPool = (await deployContract(wallets[0], GuarantorPoolArtifact, [
        guarantorPoolName,
        guarantorPoolSymbol,
        guarantorPoolDecimals,
      ])) as GuarantorPool;

      const yTokenName: string = "DAI/ETH (2021-01-01)";
      const yTokenSymbol: string = "yDAI-JAN21";
      const yTokenDecimals: number = 18;
      const underlying: string = this.underlying.address;
      const collateral: string = this.collateral.address;
      const guarantorPool: string = this.guarantorPool.address;
      const expirationTime: number = 1609459199; // December 31, 2020 at 23:59:59
      this.yToken = (await deployContract(wallets[0], YTokenArtifact, [
        yTokenName,
        yTokenSymbol,
        yTokenDecimals,
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
