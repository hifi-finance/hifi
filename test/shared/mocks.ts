import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { bn } from "../../helpers/numbers";

const { deployMockContract } = hre.waffle;

export async function deployMockFyToken(
  deployer: Signer,
  name: string,
  symbol: string,
  expirationTime: BigNumber,
): Promise<MockContract> {
  const fyTokenArtifact: Artifact = await hre.artifacts.readArtifact("FyToken");
  const fyToken: MockContract = await deployMockContract(deployer, fyTokenArtifact.abi);
  await fyToken.mock.name.returns(name);
  await fyToken.mock.symbol.returns(symbol);
  await fyToken.mock.decimals.returns(bn("18"));
  await fyToken.mock.totalSupply.returns(bn("0"));
  await fyToken.mock.expirationTime.returns(expirationTime);
  await fyToken.mock.isFyToken.returns(true);
  return fyToken;
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
