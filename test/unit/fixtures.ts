import { Signer } from "@ethersproject/abstract-signer";
import { MockContract as StubContract } from "ethereum-waffle";
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
import { deployStubErc20, deployStubFyToken } from "./stubs";

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
  fyToken: StubContract;
  hifiPool: GodModeHifiPool;
  underlying: StubContract;
};

export async function unitFixtureHifiPool(signers: Signer[]): Promise<HifiPoolFixtureReturnType> {
  const deployer: Signer = signers[0];

  const fyToken: StubContract = await deployStubFyToken(
    deployer,
    FY_TOKEN_NAME,
    FY_TOKEN_SYMBOL,
    FY_TOKEN_EXPIRATION_TIME,
  );
  const underlying: StubContract = await deployStubErc20(deployer, "USD Coin", "USDC", bn("6"));

  const hifiPoolArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHifiPool");
  const hifiPool = <GodModeHifiPool>(
    await deployContract(deployer, hifiPoolArtifact, [
      HIFI_POOL_NAME,
      HIFI_POOL_SYMBOL,
      fyToken.address,
      underlying.address,
    ])
  );
  return { fyToken, hifiPool, underlying };
}
