import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionRequest } from "@ethersproject/providers";

import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { HToken } from "../typechain/HToken";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { hTokenConstants, gasLimits, prices } from "../helpers/constants";

const overrideOptions: TransactionRequest = {
  gasLimit: process.env.CODE_COVERAGE
    ? gasLimits.coverage.deployContractGasLimit
    : gasLimits.hardhat.deployContractGasLimit,
};
const { deployContract } = hre.waffle;

export async function deployChainlinkOperator(deployer: Signer): Promise<ChainlinkOperator> {
  const chainlinkOperatorArtifact: Artifact = await hre.artifacts.readArtifact("ChainlinkOperator");
  const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>(
    await deployContract(deployer, chainlinkOperatorArtifact, [], overrideOptions)
  );
  return chainlinkOperator;
}

export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const erc20MintableArtifact: Artifact = await hre.artifacts.readArtifact("Erc20Mintable");
  const collateral: Erc20Mintable = <Erc20Mintable>(
    await deployContract(deployer, erc20MintableArtifact, ["Wrapped ETH", "WETH", BigNumber.from(18)], overrideOptions)
  );
  return collateral;
}

export async function deployCollateralPriceFeed(deployer: Signer): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const collateralPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, ["WETH/USD"], overrideOptions)
  );
  await collateralPriceFeed.setPrice(prices.oneHundredDollars);
  return collateralPriceFeed;
}

export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintrollerArtifact: Artifact = await hre.artifacts.readArtifact("Fintroller");
  const fintroller: Fintroller = <Fintroller>await deployContract(deployer, fintrollerArtifact, [], overrideOptions);
  return fintroller;
}

export async function deployHToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<HToken> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("HToken");
  const hToken: HToken = <HToken>(
    await deployContract(
      deployer,
      hTokenArtifact,
      [
        hTokenConstants.name,
        hTokenConstants.symbol,
        expirationTime,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      overrideOptions,
    )
  );
  return hToken;
}

export async function deployGodModeBalanceSheet(
  deployer: Signer,
  fintrollerAddress: string,
): Promise<GodModeBalanceSheet> {
  const godModeBalanceSheetArtifact: Artifact = await hre.artifacts.readArtifact("GodModeBalanceSheet");
  const balanceSheet: GodModeBalanceSheet = <GodModeBalanceSheet>(
    await deployContract(deployer, godModeBalanceSheetArtifact, [fintrollerAddress], overrideOptions)
  );
  return balanceSheet;
}

export async function deployGodModeHToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<GodModeHToken> {
  const godModeHTokenArtifact: Artifact = await hre.artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await deployContract(
      deployer,
      godModeHTokenArtifact,
      [
        hTokenConstants.name,
        hTokenConstants.symbol,
        hTokenConstants.expirationTime,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      overrideOptions,
    )
  );
  return hToken;
}

export async function deployGodModeRedemptionPool(
  deployer: Signer,
  fintrollerAddress: string,
  hTokenAddress: string,
): Promise<GodModeRedemptionPool> {
  const godModeRedemptionPoolArtifact: Artifact = await hre.artifacts.readArtifact("GodModeRedemptionPool");
  const redemptionPool: GodModeRedemptionPool = <GodModeRedemptionPool>(
    await deployContract(deployer, godModeRedemptionPoolArtifact, [fintrollerAddress, hTokenAddress], overrideOptions)
  );
  return redemptionPool;
}

export async function deployUnderlying(deployer: Signer): Promise<Erc20Mintable> {
  const erc20MintableArtifact: Artifact = await hre.artifacts.readArtifact("Erc20Mintable");
  const underlying: Erc20Mintable = <Erc20Mintable>(
    await deployContract(deployer, erc20MintableArtifact, ["USD Coin", "USDC", BigNumber.from(6)], overrideOptions)
  );
  return underlying;
}

export async function deployUnderlyingPriceFeed(deployer: Signer): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const underlyingPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, ["USDC/USD"], overrideOptions)
  );
  await underlyingPriceFeed.setPrice(prices.oneDollar);
  return underlyingPriceFeed;
}
