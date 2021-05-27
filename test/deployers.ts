import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import {
  COLLATERAL_DECIMALS,
  COLLATERAL_NAME,
  COLLATERAL_SYMBOL,
  H_TOKEN_EXPIRATION_TIME,
  H_TOKEN_NAME,
  H_TOKEN_SYMBOL,
  UNDERLYING_DECIMALS,
  UNDERLYING_NAME,
  UNDERLYING_SYMBOL,
} from "../helpers/constants";
import { getDeployContractOverrides } from "../helpers/env";
import { price } from "../helpers/numbers";
import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { HToken } from "../typechain/HToken";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";

const { deployContract } = hre.waffle;

export async function deployChainlinkOperator(deployer: Signer): Promise<ChainlinkOperator> {
  const chainlinkOperatorArtifact: Artifact = await hre.artifacts.readArtifact("ChainlinkOperator");
  const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>(
    await deployContract(deployer, chainlinkOperatorArtifact, [], getDeployContractOverrides())
  );
  return chainlinkOperator;
}

export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const erc20MintableArtifact: Artifact = await hre.artifacts.readArtifact("Erc20Mintable");
  const collateral: Erc20Mintable = <Erc20Mintable>(
    await deployContract(
      deployer,
      erc20MintableArtifact,
      [COLLATERAL_NAME, COLLATERAL_SYMBOL, COLLATERAL_DECIMALS],
      getDeployContractOverrides(),
    )
  );
  return collateral;
}

export async function deployCollateralPriceFeed(deployer: Signer): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const collateralPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, ["WETH/USD"], getDeployContractOverrides())
  );
  await collateralPriceFeed.setPrice(price("100"));
  return collateralPriceFeed;
}

export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintrollerArtifact: Artifact = await hre.artifacts.readArtifact("Fintroller");
  const fintroller: Fintroller = <Fintroller>(
    await deployContract(deployer, fintrollerArtifact, [], getDeployContractOverrides())
  );
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
        H_TOKEN_NAME,
        H_TOKEN_SYMBOL,
        expirationTime,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      getDeployContractOverrides(),
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
    await deployContract(deployer, godModeBalanceSheetArtifact, [fintrollerAddress], getDeployContractOverrides())
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
        H_TOKEN_NAME,
        H_TOKEN_SYMBOL,
        H_TOKEN_EXPIRATION_TIME,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      getDeployContractOverrides(),
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
    await deployContract(
      deployer,
      godModeRedemptionPoolArtifact,
      [fintrollerAddress, hTokenAddress],
      getDeployContractOverrides(),
    )
  );
  return redemptionPool;
}

export async function deployUnderlying(deployer: Signer): Promise<Erc20Mintable> {
  const erc20MintableArtifact: Artifact = await hre.artifacts.readArtifact("Erc20Mintable");
  const underlying: Erc20Mintable = <Erc20Mintable>(
    await deployContract(
      deployer,
      erc20MintableArtifact,
      [UNDERLYING_NAME, UNDERLYING_SYMBOL, UNDERLYING_DECIMALS],
      getDeployContractOverrides(),
    )
  );
  return underlying;
}

export async function deployUnderlyingPriceFeed(deployer: Signer): Promise<SimplePriceFeed> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const underlyingPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await deployContract(deployer, simplePriceFeedArtifact, ["USDC/USD"], getDeployContractOverrides())
  );
  await underlyingPriceFeed.setPrice(price("1"));
  return underlyingPriceFeed;
}
