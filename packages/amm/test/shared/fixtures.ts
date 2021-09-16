import { Signer } from "@ethersproject/abstract-signer";
import { MockContract } from "ethereum-waffle";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";
import { GodModeHifiPoolRegistry } from "../../typechain/GodModeHifiPoolRegistry";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { YieldSpaceMock } from "../../typechain/YieldSpaceMock";
import { deployGodModeHToken, deployGodModeHifiPool, deployGodModeHifiPoolRegistry, deployUsdc } from "./deployers";
import { deployMockHToken, deployMockHifiPool, deployMockUsdc } from "./mocks";

type IntegrationFixtureFixtureReturnType = {
  hToken: GodModeHToken;
  hifiPool: GodModeHifiPool;
  underlying: GodModeErc20;
};

export async function integrationFixtureHifiPool(signers: Signer[]): Promise<IntegrationFixtureFixtureReturnType> {
  const deployer: Signer = signers[0];
  const underlying: GodModeErc20 = await deployUsdc(deployer);
  const hToken: GodModeHToken = await deployGodModeHToken(deployer, underlying.address);
  const hifiPool: GodModeHifiPool = await deployGodModeHifiPool(deployer, hToken.address);
  return { hToken, hifiPool, underlying };
}

type UnitFixtureHifiPoolReturnType = {
  hToken: MockContract;
  hifiPool: GodModeHifiPool;
  underlying: MockContract;
};

export async function unitFixtureHifiPool(signers: Signer[]): Promise<UnitFixtureHifiPoolReturnType> {
  const deployer: Signer = signers[0];
  const underlying: MockContract = await deployMockUsdc(deployer);
  const hToken: MockContract = await deployMockHToken(deployer, underlying.address);
  const hifiPool: GodModeHifiPool = await deployGodModeHifiPool(deployer, hToken.address);
  return { hToken, hifiPool, underlying };
}

type UnitFixtureHifiPoolRegistryReturnType = {
  hToken: MockContract;
  hifiPool: MockContract;
  hifiPoolRegistry: GodModeHifiPoolRegistry;
};

export async function unitFixtureHifiPoolRegistry(signers: Signer[]): Promise<UnitFixtureHifiPoolRegistryReturnType> {
  const deployer: Signer = signers[0];
  const underlying: MockContract = await deployMockUsdc(deployer);
  const hToken: MockContract = await deployMockHToken(deployer, underlying.address);
  const hifiPool: MockContract = await deployMockHifiPool(deployer, hToken.address, underlying.address);
  const hifiPoolRegistry: GodModeHifiPoolRegistry = await deployGodModeHifiPoolRegistry(deployer);
  return { hToken, hifiPool, hifiPoolRegistry };
}

type UnitFixtureYieldSpaceReturnType = {
  yieldSpace: YieldSpaceMock;
};

export async function unitFixtureYieldSpace(signers: Signer[]): Promise<UnitFixtureYieldSpaceReturnType> {
  const deployer: Signer = signers[0];
  const yieldSpaceArtifact: Artifact = await artifacts.readArtifact("YieldSpaceMock");
  const yieldSpace = <YieldSpaceMock>await waffle.deployContract(deployer, yieldSpaceArtifact, []);
  return { yieldSpace };
}
