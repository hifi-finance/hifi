import { Signer } from "@ethersproject/abstract-signer";
import { TransactionRequest } from "@ethersproject/providers";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../artifacts/BalanceSheet.json";
import Erc20MintableArtifact from "../artifacts/Erc20Mintable.json";
import FintrollerArtifact from "../artifacts/Fintroller.json";
import FyTokenArtifact from "../artifacts/FyToken.json";
import GodModeBalanceSheetArtifact from "../artifacts/GodModeBalanceSheet.json";
import GodModeFyTokenArtifact from "../artifacts/GodModeFyToken.json";
import GodModeRedemptionPoolArtifact from "../artifacts/GodModeRedemptionPool.json";
import OraclePriceUtilsArtifact from "../artifacts/TestOraclePriceUtils.json";
import SimpleUniswapAnchoredViewArtifact from "../artifacts/SimpleUniswapAnchoredView.json";
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
import { deployContractGasLimit, fyTokenConstants } from "../helpers/constants";

const { deployContract } = waffle;
const overrideOptions: TransactionRequest = { gasLimit: deployContractGasLimit };

/**
 * Meant to be deployed to either Ethereum Mainnet or BuidlerEVM.
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
      fyTokenConstants.expirationTime,
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
 * Meant to be deployed only to BuidlerEVM.
 */
export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const collateral: Erc20Mintable = (await deployContract(
    deployer,
    Erc20MintableArtifact,
    [
      scenarios.buidlerEvm.collateral.name,
      scenarios.buidlerEvm.collateral.symbol,
      scenarios.buidlerEvm.collateral.decimals,
    ],
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
    [
      scenarios.buidlerEvm.underlying.name,
      scenarios.buidlerEvm.underlying.symbol,
      scenarios.buidlerEvm.underlying.decimals,
    ],
    overrideOptions,
  )) as Erc20Mintable;
  return underlying;
}
