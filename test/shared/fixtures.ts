import { Signer } from "@ethersproject/abstract-signer";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import {
  FY_TOKEN_EXPIRATION_TIME,
  FY_TOKEN_NAME,
  FY_TOKEN_SYMBOL,
  HIFI_POOL_NAME,
  HIFI_POOL_SYMBOL,
} from "../../helpers/constants";
import { bn } from "../../helpers/numbers";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";
import { YieldSpaceMock } from "../../typechain/YieldSpaceMock";
import { deployMockErc20, deployMockHToken } from "./mocks";

const { deployContract } = hre.waffle;

type YieldSpaceFixtureReturnType = {
  yieldSpace: YieldSpaceMock;
};

export async function unitFixtureYieldSpace(signers: Signer[]): Promise<YieldSpaceFixtureReturnType> {
  const deployer: Signer = signers[0];
  const yieldSpaceArtifact: Artifact = await hre.artifacts.readArtifact("YieldSpaceMock");
  const yieldSpace = <YieldSpaceMock>await deployContract(deployer, yieldSpaceArtifact, []);
  return { yieldSpace };
}

type HifiPoolFixtureReturnType = {
  hToken: MockContract;
  hifiPool: GodModeHifiPool;
  underlying: MockContract;
};

export async function unitFixtureHifiPool(signers: Signer[]): Promise<HifiPoolFixtureReturnType> {
  const deployer: Signer = signers[0];

  const hToken: MockContract = await deployMockHToken(
    deployer,
    FY_TOKEN_NAME,
    FY_TOKEN_SYMBOL,
    FY_TOKEN_EXPIRATION_TIME,
  );
  const underlying: MockContract = await deployMockErc20(deployer, "USD Coin", "USDC", bn("6"));

  const hifiPoolArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHifiPool");
  const hifiPool = <GodModeHifiPool>(
    await deployContract(deployer, hifiPoolArtifact, [
      HIFI_POOL_NAME,
      HIFI_POOL_SYMBOL,
      hToken.address,
      underlying.address,
    ])
  );
  return { hToken, hifiPool, underlying };
}
