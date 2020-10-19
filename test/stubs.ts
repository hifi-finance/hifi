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

import {
  BalanceSheetConstants,
  CollateralConstants,
  OpenPriceFeedPrecision,
  Prices,
  UnderlyingConstants,
} from "../helpers/constants";

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
  const collateral: MockContract = await deployStubErc20(
    deployer,
    CollateralConstants.Name,
    CollateralConstants.Symbol,
    CollateralConstants.Decimals,
  );
  return collateral;
}

export async function deployStubErc20(
  deployer: Signer,
  name: string,
  symbol: string,
  decimals: BigNumber,
): Promise<MockContract> {
  const collateral: MockContract = await deployStubContract(deployer, Erc20Artifact.abi);
  await collateral.mock.name.returns(name);
  await collateral.mock.symbol.returns(symbol);
  await collateral.mock.decimals.returns(decimals);
  await collateral.mock.totalSupply.returns(Zero);
  return collateral;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintroller: MockContract = await deployStubContract(deployer, FintrollerArtifact.abi);
  await fintroller.mock.isFintroller.returns(true);
  await fintroller.mock.oraclePricePrecisionScalar.returns(OpenPriceFeedPrecision);
  return fintroller;
}

export async function deployStubOracle(deployer: Signer): Promise<MockContract> {
  const oracle: MockContract = await deployStubContract(deployer, SimpleUniswapAnchoredViewArtifact.abi);
  await oracle.mock.price.withArgs(CollateralConstants.Symbol).returns(Prices.OneHundredDollars);
  await oracle.mock.price.withArgs(UnderlyingConstants.Symbol).returns(Prices.OneDollar);
  return oracle;
}

export async function deployStubRedemptionPool(deployer: Signer): Promise<MockContract> {
  const redemptionPool: MockContract = await deployStubContract(deployer, RedemptionPoolArtifact.abi);
  await redemptionPool.mock.isRedemptionPool.returns(true);
  return redemptionPool;
}

export async function deployStubUnderlying(deployer: Signer): Promise<MockContract> {
  const underlying: MockContract = await deployStubErc20(
    deployer,
    UnderlyingConstants.Name,
    UnderlyingConstants.Symbol,
    UnderlyingConstants.Decimals,
  );
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

export async function stubIsVaultOpen(this: Mocha.Context, yTokenAddress: string, account: string): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(yTokenAddress, account)
    .returns(...Object.values(BalanceSheetConstants.DefaultVault));
  await this.stubs.balanceSheet.mock.isVaultOpen.withArgs(yTokenAddress, account).returns(true);
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
    BalanceSheetConstants.DefaultVault.Debt,
    freeCollateral,
    BalanceSheetConstants.DefaultVault.LockedCollateral,
    BalanceSheetConstants.DefaultVault.IsOpen,
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
    BalanceSheetConstants.DefaultVault.Debt,
    BalanceSheetConstants.DefaultVault.FreeCollateral,
    lockedCollateral,
    BalanceSheetConstants.DefaultVault.IsOpen,
  );
}
