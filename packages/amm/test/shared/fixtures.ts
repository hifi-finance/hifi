import { Signer } from "@ethersproject/abstract-signer";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { YieldSpaceMock } from "../../typechain/YieldSpaceMock";
import { deployGodModeHToken, deployHifiPool, deployUsdc } from "./deployers";
import { deployMockHToken, deployMockUsdc } from "./mocks";

const { deployContract } = hre.waffle;

type IntegrationFixtureFixtureReturnType = {
  hToken: GodModeHToken;
  hifiPool: GodModeHifiPool;
  underlying: GodModeErc20;
};

export async function integrationFixtureHifiPool(signers: Signer[]): Promise<IntegrationFixtureFixtureReturnType> {
  const deployer: Signer = signers[0];
  const underlying: GodModeErc20 = await deployUsdc(deployer);
  const hToken: GodModeHToken = await deployGodModeHToken(deployer, underlying.address);
  const hifiPool: GodModeHifiPool = await deployHifiPool(deployer, hToken.address);
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
  const hifiPool: GodModeHifiPool = await deployHifiPool(deployer, hToken.address);
  return { hToken, hifiPool, underlying };
}

type UnitFixtureYieldSpaceReturnType = {
  yieldSpace: YieldSpaceMock;
};

export async function unitFixtureYieldSpace(signers: Signer[]): Promise<UnitFixtureYieldSpaceReturnType> {
  const deployer: Signer = signers[0];
  const yieldSpaceArtifact: Artifact = await hre.artifacts.readArtifact("YieldSpaceMock");
  const yieldSpace = <YieldSpaceMock>await deployContract(deployer, yieldSpaceArtifact, []);
  return { yieldSpace };
}
