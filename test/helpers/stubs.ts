import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { waffle } from "@nomiclabs/buidler";

import BalanceSheetArtifact from "../../artifacts/GodModeBalanceSheet.json";
import Erc20Artifact from "../../artifacts/Erc20.json";
import FintrollerArtifact from "../../artifacts/Fintroller.json";
import GuarantorPoolArtifact from "../../artifacts/GuarantorPool.json";
import RedemptionPoolArtifact from "../../artifacts/GodModeRedemptionPool.json";
import SimpleUniswapAnchoredViewArtifact from "../../artifacts/SimpleUniswapAnchoredView.json";
import YTokenArtifact from "../../artifacts/YToken.json";

import { BalanceSheetConstants, DefaultNumberOfDecimals, FintrollerConstants } from "./constants";

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
  const collateral: MockContract = await deployStubContract(deployer, Erc20Artifact.abi);
  await collateral.mock.decimals.returns(DefaultNumberOfDecimals);
  await collateral.mock.name.returns("Wrapped Ether");
  await collateral.mock.symbol.returns("WETH");
  await collateral.mock.totalSupply.returns(Zero);
  return collateral;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintroller: MockContract = await deployStubContract(deployer, FintrollerArtifact.abi);
  await fintroller.mock.isFintroller.returns(true);
  return fintroller;
}

export async function deployStubGuarantorPool(deployer: Signer): Promise<MockContract> {
  const guarantorPool: MockContract = await deployStubContract(deployer, GuarantorPoolArtifact.abi);
  await guarantorPool.mock.decimals.returns(DefaultNumberOfDecimals);
  await guarantorPool.mock.isGuarantorPool.returns(true);
  await guarantorPool.mock.name.returns("Mainframe Guarantor Shares V1");
  await guarantorPool.mock.symbol.returns("MGS-V1");
  await guarantorPool.mock.totalSupply.returns(Zero);
  return guarantorPool;
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
  const underlying: MockContract = await deployStubContract(deployer, Erc20Artifact.abi);
  await underlying.mock.decimals.returns(DefaultNumberOfDecimals);
  await underlying.mock.name.returns("Dai Stablecoin");
  await underlying.mock.symbol.returns("DAI");
  await underlying.mock.totalSupply.returns(Zero);
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

export async function stubGetBond(
  this: Mocha.Context,
  yTokenAddress: string,
  collateralizationRatioMantissa?: BigNumber,
): Promise<void> {
  await this.stubs.fintroller.mock.getBond
    .withArgs(yTokenAddress)
    .returns(collateralizationRatioMantissa || FintrollerConstants.DefaultCollateralizationRatioMantissa);
}

export async function stubGetVault(
  this: Mocha.Context,
  yTokenAddress: string,
  user: string,
  debt: BigNumber,
  freeCollateral: BigNumber,
  lockedCollateral: BigNumber,
  isOpen: boolean,
): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(yTokenAddress, user)
    .returns(debt, freeCollateral, lockedCollateral, isOpen);
}

export async function stubVaultDebt(
  this: Mocha.Context,
  yTokenAddress: string,
  user: string,
  debt: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    user,
    debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stubVaultFreeCollateral(
  this: Mocha.Context,
  yTokenAddress: string,
  user: string,
  freeCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    user,
    BalanceSheetConstants.DefaultVault.debt,
    freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stubVaultLockedCollateral(
  this: Mocha.Context,
  yTokenAddress: string,
  user: string,
  lockedCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    user,
    BalanceSheetConstants.DefaultVault.debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    lockedCollateral,
    BalanceSheetConstants.DefaultVault.isOpen,
  );
}

export async function stuVaultIsOpen(
  this: Mocha.Context,
  yTokenAddress: string,
  user: string,
  isOpen: boolean,
): Promise<void> {
  await stubGetVault.call(
    this,
    yTokenAddress,
    user,
    BalanceSheetConstants.DefaultVault.debt,
    BalanceSheetConstants.DefaultVault.freeCollateral,
    BalanceSheetConstants.DefaultVault.lockedCollateral,
    isOpen,
  );
}
