import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionRequest } from "@ethersproject/providers";
import { waffle } from "hardhat";

import BalanceSheetArtifact from "../artifacts/contracts/BalanceSheet.sol/BalanceSheet.json";
import Erc20MintableArtifact from "../artifacts/contracts/test/Erc20Mintable.sol/Erc20Mintable.json";
import FintrollerArtifact from "../artifacts/contracts/Fintroller.sol/Fintroller.json";
import FyTokenArtifact from "../artifacts/contracts/FyToken.sol/FyToken.json";
import GodModeBalanceSheetArtifact from "../artifacts/contracts/test/GodModeBalanceSheet.sol/GodModeBalanceSheet.json";
import GodModeFyTokenArtifact from "../artifacts/contracts/test/GodModeFyToken.sol/GodModeFyToken.json";
import GodModeRedemptionPoolArtifact from "../artifacts/contracts/test/GodModRedemptionPool.sol/GodModeRedemptionPool.json";
import OraclePriceUtilsArtifact from "../artifacts/contracts/test/TestOraclePriceUtils.sol/TestOraclePriceUtils.json";
import SimpleUniswapAnchoredViewArtifact from "../artifacts/contracts/test/SimpleUniswapAnchoredView.sol/SimpleUniswapAnchoredView.json";
import scenarios from "./scenarios";

import { BalanceSheet } from "../typechain/BalanceSheet";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { FyToken } from "../typechain/FyToken";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeFyToken } from "../typechain/GodModeFyToken";
import { SimpleUniswapAnchoredView } from "../typechain/SimpleUniswapAnchoredView";
import { TestOraclePriceUtils as OraclePriceUtils } from "../typechain/TestOraclePriceUtils";
import { fyTokenConstants, gasLimits } from "../helpers/constants";

const { deployContract } = waffle;
const overrideOptions: TransactionRequest = {
  gasLimit: process.env.CODE_COVERAGE
    ? gasLimits.coverage.deployContractGasLimit
    : gasLimits.hardhat.deployContractGasLimit,
};

/**
 * Meant to be deployed to either Ethereum Mainnet or Hardhat Network.
 */
export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintroller: Fintroller = (await deployContract(
    deployer,
    FintrollerArtifact,
    [],
    overrideOptions,
  )) as Fintroller;
  return fintroller;
}

/**
 * Meant to be deployed only to Ethereum Mainnet.
 */
export async function deployBalanceSheet(deployer: Signer, fintrollerAddress: string): Promise<BalanceSheet> {
  const balanceSheet: BalanceSheet = (await deployContract(
    deployer,
    BalanceSheetArtifact,
    [fintrollerAddress],
    overrideOptions,
  )) as BalanceSheet;
  return balanceSheet;
}

export async function deployFyToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<FyToken> {
  const fyToken: FyToken = (await deployContract(
    deployer,
    FyTokenArtifact,
    [
      fyTokenConstants.name,
      fyTokenConstants.symbol,
      expirationTime,
      fintrollerAddress,
      balanceSheetAddress,
      underlyingAddress,
      collateralAddress,
    ],
    overrideOptions,
  )) as FyToken;
  return fyToken;
}

/**
 * Meant to be deployed only to Hardhat Network.
 */
export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const collateral: Erc20Mintable = (await deployContract(
    deployer,
    Erc20MintableArtifact,
    [scenarios.local.collateral.name, scenarios.local.collateral.symbol, scenarios.local.collateral.decimals],
    overrideOptions,
  )) as Erc20Mintable;
  return collateral;
}

export async function deployGodModeBalanceSheet(
  deployer: Signer,
  fintrollerAddress: string,
): Promise<GodModeBalanceSheet> {
  const balanceSheet: GodModeBalanceSheet = (await deployContract(
    deployer,
    GodModeBalanceSheetArtifact,
    [fintrollerAddress],
    overrideOptions,
  )) as GodModeBalanceSheet;
  return balanceSheet;
}

export async function deployGodModeFyToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<GodModeFyToken> {
  const fyToken: GodModeFyToken = (await deployContract(
    deployer,
    GodModeFyTokenArtifact,
    [
      fyTokenConstants.name,
      fyTokenConstants.symbol,
      fyTokenConstants.expirationTime,
      fintrollerAddress,
      balanceSheetAddress,
      underlyingAddress,
      collateralAddress,
    ],
    overrideOptions,
  )) as GodModeFyToken;
  return fyToken;
}

export async function deployGodModeRedemptionPool(
  deployer: Signer,
  fintrollerAddress: string,
  fyTokenAddress: string,
): Promise<GodModeRedemptionPool> {
  const redemptionPool: GodModeRedemptionPool = (await deployContract(
    deployer,
    GodModeRedemptionPoolArtifact,
    [fintrollerAddress, fyTokenAddress],
    overrideOptions,
  )) as GodModeRedemptionPool;
  return redemptionPool;
}

export async function deployOraclePriceUtils(deployer: Signer, oracleAddress: string): Promise<OraclePriceUtils> {
  const oraclePriceUtils: OraclePriceUtils = (await deployContract(
    deployer,
    OraclePriceUtilsArtifact,
    [oracleAddress],
    overrideOptions,
  )) as OraclePriceUtils;
  return oraclePriceUtils;
}

export async function deploySimpleUniswapAnchoredView(deployer: Signer): Promise<SimpleUniswapAnchoredView> {
  const simpleUniswapAnchoredView: SimpleUniswapAnchoredView = (await deployContract(
    deployer,
    SimpleUniswapAnchoredViewArtifact,
    [],
    overrideOptions,
  )) as SimpleUniswapAnchoredView;
  return simpleUniswapAnchoredView;
}

export async function deployUnderlying(deployer: Signer): Promise<Erc20Mintable> {
  const underlying: Erc20Mintable = (await deployContract(
    deployer,
    Erc20MintableArtifact,
    [scenarios.local.underlying.name, scenarios.local.underlying.symbol, scenarios.local.underlying.decimals],
    overrideOptions,
  )) as Erc20Mintable;
  return underlying;
}
