import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../../artifacts/GodModeBalanceSheet.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import RedemptionPoolArtifact from "../../artifacts/GodModeRedemptionPool.json";
import YTokenArtifact from "../../artifacts/GodModeYToken.json";

import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool as RedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { GodModeYToken as YToken } from "../../typechain/GodModeYToken";
import { YTokenConstants } from "../../helpers/constants";

import {
  deployStubBalanceSheet,
  deployStubCollateral,
  deployStubFintroller,
  deployStubOracle,
  deployStubRedemptionPool,
  deployStubYToken,
  deployStubUnderlying,
} from "../stubs";

const { deployContract } = waffle;

type UnitFixtureBalanceSheetReturnType = {
  balanceSheet: BalanceSheet;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  yToken: MockContract;
};

export async function unitFixtureBalanceSheet(signers: Signer[]): Promise<UnitFixtureBalanceSheetReturnType> {
  const deployer: Signer = signers[0];
  const collateral: MockContract = await deployStubCollateral(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const yToken: MockContract = await deployStubYToken(deployer);
  await yToken.mock.collateral.returns(collateral.address);
  await yToken.mock.collateralPrecisionScalar.returns(BigNumber.from(1));
  await yToken.mock.underlying.returns(underlying.address);
  await yToken.mock.underlyingPrecisionScalar.returns(BigNumber.from(1));

  const balanceSheet: BalanceSheet = ((await deployContract(deployer, BalanceSheetArtifact, [
    fintroller.address,
  ])) as unknown) as BalanceSheet;
  return { balanceSheet, collateral, fintroller, oracle, underlying, yToken };
}

type UnitFixtureFintrollerReturnType = { fintroller: Fintroller; oracle: MockContract; yToken: MockContract };

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const oracle: MockContract = await deployStubOracle(deployer);
  const yToken: MockContract = await deployStubYToken(deployer);
  const fintroller: Fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
  return { fintroller, oracle, yToken };
}

type UnitFixtureRedemptionPoolReturnType = {
  fintroller: MockContract;
  redemptionPool: RedemptionPool;
  underlying: MockContract;
  yToken: MockContract;
};

export async function unitFixtureRedemptionPool(signers: Signer[]): Promise<UnitFixtureRedemptionPoolReturnType> {
  const deployer: Signer = signers[0];

  const fintroller: MockContract = await deployStubFintroller(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);

  const yToken: MockContract = await deployStubYToken(deployer);
  await yToken.mock.underlying.returns(underlying.address);
  await yToken.mock.underlyingPrecisionScalar.returns(BigNumber.from(1));

  const redemptionPool: RedemptionPool = ((await deployContract(deployer, RedemptionPoolArtifact, [
    fintroller.address,
    yToken.address,
  ])) as unknown) as RedemptionPool;
  return { fintroller, redemptionPool, underlying, yToken };
}

type UnitFixtureYTokenReturnType = {
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  yToken: YToken;
};

export async function unitFixtureYToken(signers: Signer[]): Promise<UnitFixtureYTokenReturnType> {
  const deployer: Signer = signers[0];

  const name: string = YTokenConstants.Name;
  const symbol: string = YTokenConstants.Symbol;
  const expirationTime: BigNumber = YTokenConstants.DefaultExpirationTime; /* December 31, 2020 at 23:59:59 */

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);

  const yToken: YToken = ((await deployContract(deployer, YTokenArtifact, [
    name,
    symbol,
    expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
  ])) as unknown) as YToken;

  /**
   * The yToken initializes the Redemption Pool in its constructor, but we don't want
   * it for our unit tests. With help from the god-mode, we override the Redemption Pool
   * with a mock contract.
   */
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);
  await yToken.__godMode__setRedemptionPool(redemptionPool.address);

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, yToken };
}
