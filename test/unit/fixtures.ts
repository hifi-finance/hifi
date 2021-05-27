import { Signer } from "@ethersproject/abstract-signer";
import { One } from "@ethersproject/constants";
import { MockContract } from "ethereum-waffle";

import { hTokenConstants } from "../../helpers/constants";
import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { GodModeRedemptionPool } from "../../typechain/GodModeRedemptionPool";
import {
  deployChainlinkOperator,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeHToken,
  deployGodModeRedemptionPool,
} from "../deployers";
import {
  deployStubBalanceSheet,
  deployStubChainlinkOperator,
  deployStubCollateral,
  deployStubCollateralPriceFeed,
  deployStubFintroller,
  deployStubHToken,
  deployStubRedemptionPool,
  deployStubUnderlying,
} from "./stubs";

type UnitFixtureBalanceSheetReturnType = {
  balanceSheet: GodModeBalanceSheet;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  hToken: MockContract;
};

export async function unitFixtureBalanceSheet(signers: Signer[]): Promise<UnitFixtureBalanceSheetReturnType> {
  const deployer: Signer = signers[0];

  const collateral: MockContract = await deployStubCollateral(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const oracle: MockContract = await deployStubChainlinkOperator(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const hToken: MockContract = await deployStubHToken(deployer);
  await hToken.mock.collateral.returns(collateral.address);
  await hToken.mock.collateralPrecisionScalar.returns(One);
  await hToken.mock.underlying.returns(underlying.address);
  await hToken.mock.underlyingPrecisionScalar.returns(One);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(deployer, fintroller.address);
  return { balanceSheet, collateral, fintroller, oracle, underlying, hToken };
}

type UnitFixtureChainlinkOperatorReturnType = {
  collateral: MockContract;
  collateralPriceFeed: MockContract;
  oracle: ChainlinkOperator;
};

export async function unitFixtureChainlinkOperator(signers: Signer[]): Promise<UnitFixtureChainlinkOperatorReturnType> {
  const deployer: Signer = signers[0];
  const collateral: MockContract = await deployStubCollateral(deployer);
  const collateralPriceFeed: MockContract = await deployStubCollateralPriceFeed(deployer);
  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  return { collateral, collateralPriceFeed, oracle };
}

type UnitFixtureFintrollerReturnType = {
  fintroller: Fintroller;
  hToken: MockContract;
  oracle: MockContract;
};

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const oracle: MockContract = await deployStubChainlinkOperator(deployer);
  const hToken: MockContract = await deployStubHToken(deployer);
  const fintroller: Fintroller = await deployFintroller(deployer);
  return { fintroller, hToken, oracle };
}

type UnitFixtureHTokenReturnType = {
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  hToken: GodModeHToken;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
};

export async function unitFixtureHToken(signers: Signer[]): Promise<UnitFixtureHTokenReturnType> {
  const deployer: Signer = signers[0];

  const oracle: MockContract = await deployStubChainlinkOperator(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    hTokenConstants.expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  );

  /**
   * The hToken initializes the RedemptionPool in its constructor, but we don't want
   * it for our unit tests. With help from the god-mode, we override the RedemptionPool
   * with a mock contract.
   */
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);
  await hToken.__godMode__setRedemptionPool(redemptionPool.address);

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, hToken };
}

type UnitFixtureRedemptionPoolReturnType = {
  fintroller: MockContract;
  redemptionPool: GodModeRedemptionPool;
  underlying: MockContract;
  hToken: MockContract;
};

export async function unitFixtureRedemptionPool(signers: Signer[]): Promise<UnitFixtureRedemptionPoolReturnType> {
  const deployer: Signer = signers[0];

  const fintroller: MockContract = await deployStubFintroller(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const hToken: MockContract = await deployStubHToken(deployer);
  await hToken.mock.underlying.returns(underlying.address);
  await hToken.mock.underlyingPrecisionScalar.returns(One);

  const redemptionPool: GodModeRedemptionPool = await deployGodModeRedemptionPool(
    deployer,
    fintroller.address,
    hToken.address,
  );
  return { fintroller, redemptionPool, underlying, hToken };
}
