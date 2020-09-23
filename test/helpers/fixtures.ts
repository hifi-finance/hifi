import { BigNumber } from "@ethersproject/bignumber";
import { Fixture } from "ethereum-waffle";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../../artifacts/GodModeBalanceSheet.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import RedemptionPoolArtifact from "../../artifacts/GodModeRedemptionPool.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import { Fintroller } from "../../typechain/Fintroller";
import { GodModeBalanceSheet as BalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool as RedemptionPool } from "../../typechain/GodModeRedemptionPool";
import { YToken } from "../../typechain/YToken";
import { YTokenConstants } from "./constants";

import {
  deployStubBalanceSheet,
  deployStubCollateral,
  deployStubGuarantorPool,
  deployStubFintroller,
  deployStubOracle,
  deployStubRedemptionPool,
  deployStubYToken,
  deployStubUnderlying,
} from "./stubs";

const { createFixtureLoader, deployContract } = waffle;

export function loadFixture(this: Mocha.Context): <T>(fixture: Fixture<T>) => Promise<T> {
  return createFixtureLoader(Object.values(this.signers));
}

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

  /* TODO: handle the case when the oracle isn't set. */
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  /* TODO: handle the case when the collateral isn't set. */
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

  /* TODO: handle the case when the oracle isn't set. */
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
  guarantorPool: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  yToken: YToken;
}> {
  const deployer: Signer = signers[0];

  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const oracle: MockContract = await deployStubOracle(deployer);

  /* TODO: handle the case when the oracle isn't set. */
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const guarantorPool: MockContract = await deployStubGuarantorPool(deployer);
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);

  const name: string = "DAI/ETH (2021-01-01)";
  const symbol: string = "yDAI-JAN21";
  const expirationTime: BigNumber = YTokenConstants.DefaultExpirationTime; /* December 31, 2020 at 23:59:59 */

  const yToken: YToken = ((await deployContract(deployer, YTokenArtifact, [
    name,
    symbol,
    expirationTime,
    balanceSheet.address,
    fintroller.address,
    underlying.address,
    collateral.address,
    guarantorPool.address,
    redemptionPool.address,
  ])) as unknown) as YToken;

  return { balanceSheet, collateral, fintroller, guarantorPool, oracle, redemptionPool, underlying, yToken };
}
