import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../artifacts/GodModeBalanceSheet.json";
import Erc20PermitArtifact from "../artifacts/Erc20Permit.json";
import FintrollerArtifact from "../artifacts/Fintroller.json";
import RedemptionPoolArtifact from "../artifacts/GodModeRedemptionPool.json";
import YTokenArtifact from "../artifacts/YToken.json";

import { Erc20Permit } from "../typechain/Erc20Permit";
import { Erc20PermitConstants, YTokenConstants } from "../utils/constants";
import { Fintroller } from "../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool as RedemptionPool } from "../typechain/GodModeRedemptionPool";
import { YToken } from "../typechain/YToken";

import {
  deployStubBalanceSheet,
  deployStubCollateral,
  deployStubFintroller,
  deployStubOracle,
  deployStubRedemptionPool,
  deployStubYToken,
  deployStubUnderlying,
} from "./stubs";

const { deployContract } = waffle;

export async function balanceSheetFixture(
  signers: Signer[],
): Promise<{
  balanceSheet: BalanceSheet;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  yToken: MockContract;
}> {
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

export async function erc20PermitFixture(signers: Signer[]): Promise<{ erc20Permit: Erc20Permit }> {
  const deployer: Signer = signers[0];
  const name: string = Erc20PermitConstants.name;
  const symbol: string = Erc20PermitConstants.symbol;
  const decimals = Erc20PermitConstants.decimals;
  const erc20Permit: Erc20Permit = ((await deployContract(deployer, Erc20PermitArtifact, [
    name,
    symbol,
    decimals,
  ])) as unknown) as Erc20Permit;
  return { erc20Permit };
}

export async function fintrollerFixture(
  signers: Signer[],
): Promise<{ fintroller: Fintroller; oracle: MockContract; yToken: MockContract }> {
  const deployer: Signer = signers[0];
  const oracle: MockContract = await deployStubOracle(deployer);
  const yToken: MockContract = await deployStubYToken(deployer);
  const fintroller: Fintroller = ((await deployContract(deployer, FintrollerArtifact, [])) as unknown) as Fintroller;
  return { fintroller, oracle, yToken };
}

export async function redemptionPoolFixture(
  signers: Signer[],
): Promise<{
  fintroller: MockContract;
  redemptionPool: RedemptionPool;
  underlying: MockContract;
  yToken: MockContract;
}> {
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

export async function yTokenFixture(
  signers: Signer[],
): Promise<{
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  yToken: YToken;
}> {
  const deployer: Signer = signers[0];

  const oracle: MockContract = await deployStubOracle(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);

  const name: string = "DAI/ETH (2021-01-01)";
  const symbol: string = "yDAI-JAN21";
  const expirationTime: BigNumber = YTokenConstants.DefaultExpirationTime; /* December 31, 2020 at 23:59:59 */

  const yToken: YToken = ((await deployContract(deployer, YTokenArtifact, [
    name,
    symbol,
    expirationTime,
    fintroller.address,
    balanceSheet.address,
    underlying.address,
    collateral.address,
    redemptionPool.address,
  ])) as unknown) as YToken;

  return { balanceSheet, collateral, fintroller, oracle, redemptionPool, underlying, yToken };
}
