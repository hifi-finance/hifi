import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { waffle } from "hardhat";

import BalanceSheetArtifact from "../../artifacts/contracts/BalanceSheet.sol/BalanceSheet.json";
import Erc20Artifact from "../../artifacts/@paulrberg/contracts/token/erc20/Erc20.sol/Erc20.json";
import FintrollerArtifact from "../../artifacts/contracts/Fintroller.sol/Fintroller.json";
import FyTokenArtifact from "../../artifacts/contracts/FyToken.sol/FyToken.json";
import RedemptionPoolArtifact from "../../artifacts/contracts/RedemptionPool.sol/RedemptionPool.json";
import SimpleUniswapAnchoredViewArtifact from "../../artifacts/contracts/test/SimpleUniswapAnchoredView.sol/SimpleUniswapAnchoredView.json";
import scenarios from "../scenarios";

import { balanceSheetConstants, etherSymbol, openPriceFeedPrecision } from "../../helpers/constants";

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
    scenarios.local.collateral.name,
    scenarios.local.collateral.symbol,
    scenarios.local.collateral.decimals,
  );
  return collateral;
}

export async function deployStubErc20(
  deployer: Signer,
  name: string,
  symbol: string,
  decimals: BigNumber,
): Promise<MockContract> {
  const erc20: MockContract = await deployStubContract(deployer, Erc20Artifact.abi);
  await erc20.mock.name.returns(name);
  await erc20.mock.symbol.returns(symbol);
  await erc20.mock.decimals.returns(decimals);
  await erc20.mock.totalSupply.returns(Zero);
  return erc20;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintroller: MockContract = await deployStubContract(deployer, FintrollerArtifact.abi);
  await fintroller.mock.isFintroller.returns(true);
  await fintroller.mock.oraclePricePrecisionScalar.returns(openPriceFeedPrecision);
  return fintroller;
}

export async function deployStubFyToken(deployer: Signer): Promise<MockContract> {
  const fyToken: MockContract = await deployStubContract(deployer, FyTokenArtifact.abi);
  await fyToken.mock.isFyToken.returns(true);
  return fyToken;
}

export async function deployStubOracle(deployer: Signer): Promise<MockContract> {
  const oracle: MockContract = await deployStubContract(deployer, SimpleUniswapAnchoredViewArtifact.abi);
  await oracle.mock.price.withArgs(etherSymbol).returns(scenarios.local.oracle.prices.collateral);
  await oracle.mock.price.withArgs(scenarios.local.underlying.symbol).returns(scenarios.local.oracle.prices.underlying);
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
    scenarios.local.underlying.name,
    scenarios.local.underlying.symbol,
    scenarios.local.underlying.decimals,
  );
  return underlying;
}

/**
 * FUNCTION STUBS
 */
export async function stubGetVault(
  this: Mocha.Context,
  fyTokenAddress: string,
  account: string,
  debt: BigNumber,
  freeCollateral: BigNumber,
  lockedCollateral: BigNumber,
  isOpen: boolean,
): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(fyTokenAddress, account)
    .returns(debt, freeCollateral, lockedCollateral, isOpen);
}

export async function stubIsVaultOpen(this: Mocha.Context, fyTokenAddress: string, account: string): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(fyTokenAddress, account)
    .returns(...Object.values(balanceSheetConstants.defaultVault));
  await this.stubs.balanceSheet.mock.isVaultOpen.withArgs(fyTokenAddress, account).returns(true);
}

export async function stubVaultFreeCollateral(
  this: Mocha.Context,
  fyTokenAddress: string,
  account: string,
  freeCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    fyTokenAddress,
    account,
    balanceSheetConstants.defaultVault.debt,
    freeCollateral,
    balanceSheetConstants.defaultVault.lockedCollateral,
    balanceSheetConstants.defaultVault.isOpen,
  );
}

export async function stubVaultLockedCollateral(
  this: Mocha.Context,
  fyTokenAddress: string,
  account: string,
  lockedCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    fyTokenAddress,
    account,
    balanceSheetConstants.defaultVault.debt,
    balanceSheetConstants.defaultVault.freeCollateral,
    lockedCollateral,
    balanceSheetConstants.defaultVault.isOpen,
  );
}
