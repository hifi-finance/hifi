import { Signer } from "@ethersproject/abstract-signer";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { H_TOKEN_DECIMALS, USDC_DECIMALS, USDC_NAME, USDC_PRICE_PRECISION_SCALAR, USDC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

const { deployMockContract } = hre.waffle;

export async function deployMockHToken(deployer: Signer, underlyingAddress: string): Promise<MockContract> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHToken");
  const hToken: MockContract = await deployMockContract(deployer, hTokenArtifact.abi);
  await hToken.mock.name.returns(getHTokenName(H_TOKEN_MATURITY_ONE_YEAR));
  await hToken.mock.symbol.returns(getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR));
  await hToken.mock.decimals.returns(H_TOKEN_DECIMALS);
  await hToken.mock.maturity.returns(H_TOKEN_MATURITY_ONE_YEAR);
  await hToken.mock.underlying.returns(underlyingAddress);
  await hToken.mock.underlyingPrecisionScalar.returns(USDC_PRICE_PRECISION_SCALAR);
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
