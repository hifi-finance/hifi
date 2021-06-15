import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { bn } from "../../helpers/numbers";

const { deployMockContract } = hre.waffle;

export async function deployMockHToken(
  deployer: Signer,
  name: string,
  symbol: string,
  expirationTime: BigNumber,
): Promise<MockContract> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("HToken");
  const hToken: MockContract = await deployMockContract(deployer, hTokenArtifact.abi);
  await hToken.mock.name.returns(name);
  await hToken.mock.symbol.returns(symbol);
  await hToken.mock.decimals.returns(bn("18"));
  await hToken.mock.totalSupply.returns(bn("0"));
  await hToken.mock.expirationTime.returns(expirationTime);
  return hToken;
}

export async function deployMockErc20(
  deployer: Signer,
  name: string,
  symbol: string,
  decimals: BigNumber,
): Promise<MockContract> {
  const erc20Artifact: Artifact = await hre.artifacts.readArtifact("Erc20");
  const erc20: MockContract = await deployMockContract(deployer, erc20Artifact.abi);
  await erc20.mock.name.returns(name);
  await erc20.mock.symbol.returns(symbol);
  await erc20.mock.decimals.returns(decimals);
  await erc20.mock.totalSupply.returns(bn("0"));
  return erc20;
}
