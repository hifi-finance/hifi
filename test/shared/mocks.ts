import { Signer } from "@ethersproject/abstract-signer";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import {
  H_TOKEN_EXPIRATION_TIME,
  H_TOKEN_NAME,
  H_TOKEN_SYMBOL,
  USDC_DECIMALS,
  USDC_NAME,
  USDC_SYMBOL,
} from "../../helpers/constants";
import { bn } from "../../helpers/numbers";

const { deployMockContract } = hre.waffle;

export async function deployMockHToken(deployer: Signer): Promise<MockContract> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHToken");
  const hToken: MockContract = await deployMockContract(deployer, hTokenArtifact.abi);
  await hToken.mock.name.returns(H_TOKEN_NAME);
  await hToken.mock.symbol.returns(H_TOKEN_SYMBOL);
  await hToken.mock.decimals.returns(bn("18"));
  await hToken.mock.totalSupply.returns(bn("0"));
  await hToken.mock.expirationTime.returns(H_TOKEN_EXPIRATION_TIME);
  return hToken;
}

export async function deployMockUsdc(deployer: Signer): Promise<MockContract> {
  const erc20Artifact: Artifact = await hre.artifacts.readArtifact("Erc20");
  const erc20: MockContract = await deployMockContract(deployer, erc20Artifact.abi);
  await erc20.mock.decimals.returns(USDC_DECIMALS);
  await erc20.mock.name.returns(USDC_NAME);
  await erc20.mock.symbol.returns(USDC_SYMBOL);
  return erc20;
}
