import { Signer } from "@ethersproject/abstract-signer";
import { MockContract as StubContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

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
    "Hifi USDC (2022-06-30)",
    "hUSDCJun22",
    bn("1656626400"), // June 30, 2022
  );
  const underlying: StubContract = await deployStubErc20(deployer, "USD Coin", "USDC", bn("6"));

  const hifiPoolArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHifiPool");
  const hifiPool = <GodModeHifiPool>(
    await deployContract(deployer, hifiPoolArtifact, [
      "Hifi USDC (2022-06-30) Pool",
      "hUSDCJun22LP",
      fyToken.address,
      underlying.address,
    ])
  );
  return { fyToken, hifiPool, underlying };
}
