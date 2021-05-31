import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import {
  CHAINLINK_PRICE_PRECISION,
  H_TOKEN_DECIMALS,
  USDC_DECIMALS,
  USDC_NAME,
  USDC_SYMBOL,
  WBTC_DECIMALS,
  WBTC_NAME,
  WBTC_SYMBOL,
  WETH_DECIMALS,
  WETH_NAME,
  WETH_SYMBOL,
} from "../../helpers/constants";
import { getHTokenName, getHTokenSymbol } from "../../helpers/contracts";

const { deployMockContract } = hre.waffle;

export async function deployMockBalanceSheet(deployer: Signer): Promise<MockContract> {
  const balanceSheetArtifact: Artifact = await hre.artifacts.readArtifact("BalanceSheet");
  const balanceSheet: MockContract = await deployMockContract(deployer, balanceSheetArtifact.abi);
  return balanceSheet;
}

export async function deployMockChainlinkOperator(deployer: Signer): Promise<MockContract> {
  const chainlinkOperatorArtifact: Artifact = await hre.artifacts.readArtifact("ChainlinkOperator");
  const chainlinkOperator: MockContract = await deployMockContract(deployer, chainlinkOperatorArtifact.abi);
  return chainlinkOperator;
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
  await erc20.mock.totalSupply.returns(Zero);
  return erc20;
}

export async function deployMockFintroller(deployer: Signer): Promise<MockContract> {
  const fintrollerArtifact: Artifact = await hre.artifacts.readArtifact("Fintroller");
  const fintroller: MockContract = await deployMockContract(deployer, fintrollerArtifact.abi);
  return fintroller;
}

export async function deployMockHToken(deployer: Signer, expirationTime: BigNumber): Promise<MockContract> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("HToken");
  const hToken: MockContract = await deployMockContract(deployer, hTokenArtifact.abi);
  await hToken.mock.name.returns(getHTokenName(expirationTime));
  await hToken.mock.symbol.returns(getHTokenSymbol(expirationTime));
  await hToken.mock.decimals.returns(H_TOKEN_DECIMALS);
  await hToken.mock.totalSupply.returns(Zero);
  return hToken;
}

export async function deployMockSimplePriceFeed(deployer: Signer, price: BigNumber): Promise<MockContract> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const simplePriceFeed: MockContract = await deployMockContract(deployer, simplePriceFeedArtifact.abi);
  await simplePriceFeed.mock.decimals.returns(CHAINLINK_PRICE_PRECISION);
  await simplePriceFeed.mock.latestRoundData.returns(Zero, price, Zero, Zero, Zero);
  return simplePriceFeed;
}

export async function deployMockUsdc(deployer: Signer): Promise<MockContract> {
  return deployMockErc20(deployer, USDC_NAME, USDC_SYMBOL, USDC_DECIMALS);
}

export async function deployMockWbtc(deployer: Signer): Promise<MockContract> {
  return deployMockErc20(deployer, WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS);
}

export async function deployMockWeth(deployer: Signer): Promise<MockContract> {
  return deployMockErc20(deployer, WETH_NAME, WETH_SYMBOL, WETH_DECIMALS);
}
