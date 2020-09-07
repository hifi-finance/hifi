import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../../artifacts/BalanceSheet.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import RedemptionPoolArtifact from "../../artifacts/RedemptionPool.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import { DefaultBlockGasLimit } from "./constants";
import { BalanceSheet } from "../../typechain/BalanceSheet";
import { Fintroller } from "../../typechain/Fintroller";
import { RedemptionPool } from "../../typechain/RedemptionPool";
import { YToken } from "../../typechain/YToken";

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

const { deployContract } = waffle;

export async function balanceSheetFixture(
  signers: Signer[],
): Promise<{
  balanceSheet: BalanceSheet;
  collateral: MockContract;
  fintroller: MockContract;
  oracle: MockContract;
  yToken: MockContract;
}> {
  const deployer: Signer = signers[0];
  const collateral: MockContract = await deployStubCollateral(deployer);
  const oracle: MockContract = await deployStubOracle(deployer);

  /* TODO: handle the case when the oracle isn't set. */
  const fintroller: MockContract = await deployStubFintroller(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  /* TODO: handle the case when the collateral isn't set. */
  const yToken: MockContract = await deployStubYToken(deployer);
  await yToken.mock.collateral.returns(collateral.address);

  const balanceSheet: BalanceSheet = ((await deployContract(deployer, BalanceSheetArtifact, [
    fintroller.address,
  ])) as unknown) as BalanceSheet;
  return { balanceSheet, collateral, fintroller, oracle, yToken };
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
): Promise<{ redemptionPool: RedemptionPool; yToken: MockContract }> {
  const deployer: Signer = signers[0];
  const yToken: MockContract = await deployStubYToken(deployer);
  const redemptionPool: RedemptionPool = ((await deployContract(deployer, RedemptionPoolArtifact, [
    yToken.address,
  ])) as unknown) as RedemptionPool;
  return { redemptionPool, yToken };
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

  /* TODO: handle the case when the oracle isn't set. */
  const balanceSheet: MockContract = await deployStubBalanceSheet(deployer);
  const fintroller: MockContract = await deployStubFintroller(deployer);
  const oracle: MockContract = await deployStubOracle(deployer);
  await fintroller.mock.oracle.returns(oracle.address);

  const underlying: MockContract = await deployStubUnderlying(deployer);
  const collateral: MockContract = await deployStubCollateral(deployer);
  const guarantorPool: MockContract = await deployStubGuarantorPool(deployer);
  const redemptionPool: MockContract = await deployStubRedemptionPool(deployer);

  const name: string = "DAI/ETH (2021-01-01)";
  const symbol: string = "yDAI-JAN21";
  const decimals: BigNumber = BigNumber.from(18);
  /* December 31, 2020 at 23:59:59 */
  const expirationTime: BigNumber = BigNumber.from(1609459199);

  const yToken: YToken = ((await deployContract(
    deployer,
    YTokenArtifact,
    [
      name,
      symbol,
      decimals,
      expirationTime,
      balanceSheet.address,
      fintroller.address,
      underlying.address,
      collateral.address,
      guarantorPool.address,
      redemptionPool.address,
    ],
    { gasLimit: DefaultBlockGasLimit },
  )) as unknown) as YToken;

  return { balanceSheet, collateral, fintroller, guarantorPool, oracle, redemptionPool, underlying, yToken };
}
