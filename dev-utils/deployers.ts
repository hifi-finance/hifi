import { Signer } from "@ethersproject/abstract-signer";
import { deployContract } from "ethereum-waffle";

import DumbOracleArtifact from "../artifacts/DumbOracle.json";
import Erc20MintableArtifact from "../artifacts/Erc20Mintable.json";
import FintrollerArtifact from "../artifacts/Fintroller.json";
import GuarantorPoolArtifact from "../artifacts/GuarantorPool.json";
import SuperMinterArtifact from "../artifacts/SuperMinter.json";
import YTokenArtifact from "../artifacts/YToken.json";

import { DumbOracle } from "../typechain/DumbOracle";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { GuarantorPool } from "../typechain/GuarantorPool";
import { SuperMinter } from "../typechain/SuperMinter";
import { YToken } from "../typechain/YToken";

/**
 * Throughout this file, we use "as unknown" a couple of times. Refer to the URL for more information.
 * https://bit.ly/3i7mxrh
 */

export async function deployFintroller(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
}

export async function deployFintroller2(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
}

export async function deployCollateral(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.collateral = ((await deployContract(deployer, Erc20MintableArtifact, [
    this.scenario.collateral.name,
    this.scenario.collateral.symbol,
    this.scenario.collateral.decimals,
  ])) as unknown) as Erc20Mintable;
}

export async function deployGuarantorPool(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.guarantorPool = ((await deployContract(deployer, GuarantorPoolArtifact, [
    this.scenario.guarantorPool.name,
    this.scenario.guarantorPool.symbol,
    this.scenario.guarantorPool.decimals,
  ])) as unknown) as GuarantorPool;
}

export async function deployOracle(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.oracle = ((await deployContract(deployer, DumbOracleArtifact, [])) as unknown) as DumbOracle;
}

export async function deploySuperMinter(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.superMinter = ((await deployContract(deployer, SuperMinterArtifact, [])) as unknown) as SuperMinter;
}

export async function deployUnderlying(this: Mocha.Context, deployer: Signer): Promise<void> {
  this.underlying = ((await deployContract(deployer, Erc20MintableArtifact, [
    this.scenario.underlying.name,
    this.scenario.underlying.symbol,
    this.scenario.underlying.decimals,
  ])) as unknown) as Erc20Mintable;
}

export async function deployYToken(this: Mocha.Context, deployer: Signer): Promise<void> {
  await deployUnderlying.call(this, deployer);
  await deployCollateral.call(this, deployer);
  await deployGuarantorPool.call(this, deployer);

  this.yToken = ((await deployContract(deployer, YTokenArtifact, [
    this.scenario.yToken.name,
    this.scenario.yToken.symbol,
    this.scenario.yToken.decimals,
    this.fintroller.address,
    this.underlying.address,
    this.collateral.address,
    this.guarantorPool.address,
    this.scenario.yToken.expirationTime,
  ])) as unknown) as YToken;
}
