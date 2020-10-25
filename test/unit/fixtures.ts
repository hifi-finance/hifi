import { MockContract } from "ethereum-waffle";
import { One } from "@ethersproject/constants";
import { Signer } from "@ethersproject/abstract-signer";

import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeFyToken } from "../../typechain/GodModeFyToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { TestOraclePriceUtils as OraclePriceUtils } from "../../typechain/TestOraclePriceUtils";

import {
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeFyToken,
  deployGodModeRedemptionPool,
  deployOraclePriceUtils,
} from "../deployers";
import {
  deployStubBalanceSheet,
  deployStubCollateral,
  deployStubFintroller,
  deployStubOracle,
  deployStubRedemptionPool,
  deployStubFyToken,
  deployStubUnderlying,
} from "./stubs";
import { fyTokenConstants } from "../../helpers/constants";

type UnitFixtureBalanceSheetReturnType = {
  balanceSheet: GodModeBalanceSheet;
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

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);
  return { balanceSheet, collateral, fintroller, oracle, underlying, fyToken };
}

type UnitFixtureFintrollerReturnType = { fintroller: Fintroller; oracle: MockContract; fyToken: MockContract };

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const oracle: MockContract = await deployStubOracle(deployer);
  const fyToken: MockContract = await deployStubFyToken(deployer);
  const fintroller = await deployFintroller(deployer);
  return { fintroller, oracle, fyToken };
}

type UnitFixtureFyTokenReturnType = {
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  fyToken: GodModeFyToken;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
};

export async function unitFixtureFyToken(signers: Signer[]): Promise<UnitFixtureFyTokenReturnType> {
  const deployer: Signer = signers[0];

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const fyToken: GodModeFyToken = await deployGodModeFyToken(
    deployer,
    fyTokenConstants.expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );

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
  const oraclePriceUtils: OraclePriceUtils = await deployOraclePriceUtils(deployer, oracle.address);
  return { collateral, oracle, oraclePriceUtils };
}

type UnitFixtureRedemptionPoolReturnType = {
  fintroller: MockContract;
  redemptionPool: GodModeRedemptionPool;
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

  const redemptionPool: GodModeRedemptionPool = await deployGodModeRedemptionPool(
    deployer,
    fintroller.address,
    fyToken.address,
  );
  return { fintroller, redemptionPool, underlying, fyToken };
}
