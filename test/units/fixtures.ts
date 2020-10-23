import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { One } from "@ethersproject/constants";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../../artifacts/GodModeBalanceSheet.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import FyTokenArtifact from "../../artifacts/GodModeFyToken.json";
import OraclePriceUtilsArtifact from "../../artifacts/TestOraclePriceUtils.json";
import RedemptionPoolArtifact from "../../artifacts/GodModeRedemptionPool.json";

import { Fintroller } from "../../typechain/Fintroller";
import { FyTokenConstants } from "../../helpers/constants";
import { GodModeBalanceSheet as BalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken as FyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool as RedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { TestOraclePriceUtils as OraclePriceUtils } from "../../typechain/TestOraclePriceUtils";

import {
  deployStubBalanceSheet,
  deployStubCollateral,
  deployStubFintroller,
  deployStubOracle,
  deployStubRedemptionPool,
  deployStubFyToken,
  deployStubUnderlying,
} from "../stubs";

const { deployContract } = waffle;

type UnitFixtureBalanceSheetReturnType = {
  balanceSheet: BalanceSheet;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  fyToken: MockContract;
};

export async function unitFixtureBalanceSheet(signers: Signer[]): Promise<UnitFixtureBalanceSheetReturnType> {
  const deployer: Signer = signers[0];
  const collateral: MockContract = await deployStubCollateral(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const fyToken: MockContract = await deployStubFyToken(deployer);
  await fyToken.mock.collateral.returns(collateral.address);
  await fyToken.mock.collateralPrecisionScalar.returns(One);
  await fyToken.mock.underlying.returns(underlying.address);
  await fyToken.mock.underlyingPrecisionScalar.returns(One);

  const balanceSheet: BalanceSheet = ((await deployContract(deployer, BalanceSheetArtifact, [
    fintroller.address,
  ])) as unknown) as BalanceSheet;
  return { balanceSheet, collateral, fintroller, oracle, underlying, fyToken };
}

type UnitFixtureFintrollerReturnType = { fintroller: Fintroller; oracle: MockContract; fyToken: MockContract };

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const oracle: MockContract = await deployStubOracle(deployer);
  const fyToken: MockContract = await deployStubFyToken(deployer);
  const fintroller: Fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
  return { fintroller, oracle, fyToken };
}

type UnitFixtureFyTokenReturnType = {
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  fyToken: FyToken;
};

export async function unitFixtureFyToken(signers: Signer[]): Promise<UnitFixtureFyTokenReturnType> {
  const deployer: Signer = signers[0];

  const name: string = FyTokenConstants.Name;
  const symbol: string = FyTokenConstants.Symbol;
  const expirationTime: BigNumber = FyTokenConstants.ExpirationTime;

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);

  const fyToken: FyToken = ((await deployContract(deployer, FyTokenArtifact, [
    name,
    symbol,
    expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  ])) as unknown) as FyToken;

  /**
   * The fyToken initializes the Redemption Pool in its constructor, but we don't want
   * it for our unit tests. With help from the god-mode, we override the Redemption Pool
   * with a mock contract.
   */
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);
  await fyToken.__godMode__setRedemptionPool(redemptionPool.address);

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, fyToken };
}

type UnitFixtureOraclePriceUtilsReturnType = {
  collateral: MockContract;
  oracle: MockContract;
  oraclePriceUtils: OraclePriceUtils;
};

export async function unitFixtureOraclePriceUtils(signers: Signer[]): Promise<UnitFixtureOraclePriceUtilsReturnType> {
  const deployer: Signer = signers[0];
  const collateral: MockContract = await deployStubCollateral(deployer);
  const oracle: MockContract = await deployStubOracle(deployer);
  const oraclePriceUtils: OraclePriceUtils = ((await deployContract(deployer, OraclePriceUtilsArtifact, [
    oracle.address,
  ])) as unknown) as OraclePriceUtils;
  return { collateral, oracle, oraclePriceUtils };
}

type UnitFixtureRedemptionPoolReturnType = {
  fintroller: MockContract;
  redemptionPool: RedemptionPool;
  underlying: MockContract;
  fyToken: MockContract;
};

export async function unitFixtureRedemptionPool(signers: Signer[]): Promise<UnitFixtureRedemptionPoolReturnType> {
  const deployer: Signer = signers[0];

  const fintroller: MockContract = await deployStubFintroller(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const fyToken: MockContract = await deployStubFyToken(deployer);
  await fyToken.mock.underlying.returns(underlying.address);
  await fyToken.mock.underlyingPrecisionScalar.returns(One);

  const redemptionPool: RedemptionPool = ((await deployContract(deployer, RedemptionPoolArtifact, [
    fintroller.address,
    fyToken.address,
  ])) as unknown) as RedemptionPool;
  return { fintroller, redemptionPool, underlying, fyToken };
}
