import type { Signer } from "@ethersproject/abstract-signer";
import { H_TOKEN_DECIMALS, USDC_DECIMALS, USDC_NAME, USDC_PRICE_PRECISION_SCALAR, USDC_SYMBOL } from "@hifi/constants";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol, getHifiPoolName, getHifiPoolSymbol } from "@hifi/helpers";
import { MockContract } from "ethereum-waffle";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

export async function deployMockHToken(deployer: Signer, underlyingAddress: string): Promise<MockContract> {
  const hTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const hToken: MockContract = await waffle.deployMockContract(deployer, hTokenArtifact.abi);
  await hToken.mock.name.returns(getHTokenName(H_TOKEN_MATURITY_ONE_YEAR));
  await hToken.mock.symbol.returns(getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR));
  await hToken.mock.decimals.returns(H_TOKEN_DECIMALS);
  await hToken.mock.maturity.returns(H_TOKEN_MATURITY_ONE_YEAR);
  await hToken.mock.underlying.returns(underlyingAddress);
  await hToken.mock.underlyingPrecisionScalar.returns(USDC_PRICE_PRECISION_SCALAR);
  return hToken;
}

export async function deployMockUsdc(deployer: Signer): Promise<MockContract> {
  const erc20Artifact: Artifact = await artifacts.readArtifact("Erc20");
  const erc20: MockContract = await waffle.deployMockContract(deployer, erc20Artifact.abi);
  await erc20.mock.decimals.returns(USDC_DECIMALS);
  await erc20.mock.name.returns(USDC_NAME);
  await erc20.mock.symbol.returns(USDC_SYMBOL);
  return erc20;
}

export async function deployMockHifiPool(
  deployer: Signer,
  hTokenAddress: string,
  underlyingAddress: string,
): Promise<MockContract> {
  const hifiPoolArtifact: Artifact = await artifacts.readArtifact("GodModeHifiPool");
  const hifiPool: MockContract = await waffle.deployMockContract(deployer, hifiPoolArtifact.abi);
  await hifiPool.mock.name.returns(getHifiPoolName(H_TOKEN_MATURITY_ONE_YEAR));
  await hifiPool.mock.symbol.returns(getHifiPoolSymbol(H_TOKEN_MATURITY_ONE_YEAR));
  await hifiPool.mock.hToken.returns(hTokenAddress);
  await hifiPool.mock.maturity.returns(H_TOKEN_MATURITY_ONE_YEAR);
  await hifiPool.mock.underlying.returns(underlyingAddress);
  await hifiPool.mock.underlyingPrecisionScalar.returns(USDC_PRICE_PRECISION_SCALAR);
  return hifiPool;
}
