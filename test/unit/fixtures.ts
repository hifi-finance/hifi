import { Signer } from "@ethersproject/abstract-signer";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { YieldSpaceMock } from "../../typechain/YieldSpaceMock";

const { deployContract } = hre.waffle;

type YieldSpaceFixtureReturnType = {
  yieldSpace: YieldSpaceMock;
};

export async function unitFixtureYieldSpace(signers: Signer[]): Promise<YieldSpaceFixtureReturnType> {
  const deployer: Signer = signers[0];
  const yieldSpaceArtifact: Artifact = await hre.artifacts.readArtifact("YieldSpaceMock");
  const yieldSpace: YieldSpaceMock = <YieldSpaceMock>await deployContract(deployer, yieldSpaceArtifact, []);
  return { yieldSpace };
}
