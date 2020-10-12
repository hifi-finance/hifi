import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../artifacts/GodModeBalanceSheet.json";
import Erc20Artifact from "../artifacts/Erc20.json";
import FintrollerArtifact from "../artifacts/Fintroller.json";
import RedemptionPoolArtifact from "../artifacts/GodModeRedemptionPool.json";
import SimpleUniswapAnchoredViewArtifact from "../artifacts/SimpleUniswapAnchoredView.json";
import YTokenArtifact from "../artifacts/YToken.json";

import { BalanceSheetConstants, DefaultNumberOfDecimals, FintrollerConstants } from "../utils/constants";

const { deployMockContract: deployStubContract } = waffle;

/**
 * DEPLOYERS
 */
export async function deployStubBalanceSheet(deployer: Signer): Promise<MockContract> {
  const balanceSheet: MockContract = await deployStubContract(deployer, BalanceSheetArtifact.abi);
  await balanceSheet.mock.isBalanceSheet.returns(true);
  return balanceSheet;
}

export async function deployStubCollateral(deployer: Signer): Promise<MockContract> {
  const collateral: MockContract = await deployStubErc20(deployer, DefaultNumberOfDecimals, "Wrapped Ether", "WETH");
  return collateral;
}

export async function deployStubErc20(
  deployer: Signer,
  decimals: BigNumber,
  name: string,
  symbol: string,
): Promise<MockContract> {
  const collateral: MockContract = await deployStubContract(deployer, Erc20Artifact.abi);
  await collateral.mock.decimals.returns(decimals);
  await collateral.mock.name.returns(name);
  await collateral.mock.symbol.returns(symbol);
  await collateral.mock.totalSupply.returns(Zero);
  return collateral;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintroller: MockContract = await deployStubContract(deployer, FintrollerArtifact.abi);
  await fintroller.mock.isFintroller.returns(true);
  await fintroller.mock.oraclePricePrecisionScalar.returns(FintrollerConstants.OraclePrecisionScalar);
  return fintroller;
}

export async function deployStubOracle(deployer: Signer): Promise<MockContract> {
  const oracle: MockContract = await deployStubContract(deployer, SimpleUniswapAnchoredViewArtifact.abi);
  await oracle.mock.price.withArgs("WETH").returns(BigNumber.from(100000000));
  await oracle.mock.price.withArgs("DAI").returns(BigNumber.from(1000000));
  return oracle;
}

export async function deployStubRedemptionPool(deployer: Signer): Promise<MockContract> {
  const redemptionPool: MockContract = await deployStubContract(deployer, RedemptionPoolArtifact.abi);
  await redemptionPool.mock.isRedemptionPool.returns(true);
  return redemptionPool;
}

export async function deployStubUnderlying(deployer: Signer): Promise<MockContract> {
  const underlying: MockContract = await deployStubErc20(deployer, DefaultNumberOfDecimals, "Dai Stablecoin", "DAI");
  return underlying;
}

export async function deployStubYToken(deployer: Signer): Promise<MockContract> {
  const yToken: MockContract = await deployStubContract(deployer, YTokenArtifact.abi);
  await yToken.mock.isYToken.returns(true);
  return yToken;
}

/**
 * FUNCTION STUBS
 */
export async function stubLiquidateBorrowInternalCalls(
  this: Mocha.Context,
  yTokenAddress: string,
  newBorrowAmount: BigNumber,
  repayAmount: BigNumber,
  clutchedCollateralAmount: BigNumber,
): Promise<void> {
  await this.stubs.balanceSheet.mock.setVaultDebt
    .withArgs(yTokenAddress, this.accounts.brad, newBorrowAmount)
    .returns(true);
  await this.stubs.balanceSheet.mock.getClutchableCollateral
    .withArgs(yTokenAddress, repayAmount)
    .returns(clutchedCollateralAmount);
  await this.stubs.balanceSheet.mock.clutchCollateral
    .withArgs(yTokenAddress, this.accounts.grace, this.accounts.brad, clutchedCollateralAmount)
    .returns(clutchedCollateralAmount);
}

export async function stubGetBondCollateralizationRatio(
  this: Mocha.Context,
  yTokenAddress: string,
  collateralizationRatioMantissa?: BigNumber,
): Promise<void> {
  await this.stubs.fintroller.mock.getBondCollateralizationRatio
    .withArgs(yTokenAddress)
    .returns(collateralizationRatioMantissa || FintrollerConstants.DefaultCollateralizationRatioMantissa);
}

export async function stubGetVault(
  this: Mocha.Context,
  yTokenAddress: string,
  account: string,
  debt: BigNumber,
  freeCollateral: BigNumber,
  lockedCollateral: BigNumber,
  isOpen: boolean,
): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(yTokenAddress, account)
    .returns(debt, freeCollateral, lockedCollateral, isOpen);
}

export async function stubOpenVault(this: Mocha.Context, yTokenAddress: string, account: string): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(yTokenAddress, account)
    .returns(...Object.values(BalanceSheetConstants.DefaultVault));
  await this.stubs.balanceSheet.mock.isVaultOpen.withArgs(yTokenAddress, account).returns(true);
}

export async function stubVaultDebt(
  this: Mocha.Context,
  yTokenAddress: string,
  account: string,
  debt: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    account,
    debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stubVaultFreeCollateral(
  this: Mocha.Context,
  yTokenAddress: string,
  account: string,
  freeCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    account,
    BalanceSheetConstants.DefaultVault.debt,
    freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stubVaultLockedCollateral(
  this: Mocha.Context,
  yTokenAddress: string,
  account: string,
  lockedCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    account,
    BalanceSheetConstants.DefaultVault.debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stuVaultIsOpen(
  this: Mocha.Context,
  yTokenAddress: string,
  account: string,
  isOpen: boolean,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    account,
    BalanceSheetConstants.DefaultVault.debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    isOpen,
  );
}
