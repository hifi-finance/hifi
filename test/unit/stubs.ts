import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";
import { waffle } from "hardhat";

import BalanceSheetArtifact from "../../artifacts/contracts/BalanceSheet.sol/BalanceSheet.json";
import ChainlinkOperatorArtifact from "../../artifacts/contracts/oracles/ChainlinkOperator.sol/ChainlinkOperator.json";
import DummyPriceFeedArtifact from "../../artifacts/contracts/test/DummyPriceFeed.sol/DummyPriceFeed.json";
import Erc20Artifact from "../../artifacts/@paulrberg/contracts/token/erc20/Erc20.sol/Erc20.json";
import FintrollerArtifact from "../../artifacts/contracts/Fintroller.sol/Fintroller.json";
import FyTokenArtifact from "../../artifacts/contracts/FyToken.sol/FyToken.json";
import RedemptionPoolArtifact from "../../artifacts/contracts/RedemptionPool.sol/RedemptionPool.json";

import { balanceSheetConstants, chainlinkPricePrecision, prices } from "../../helpers/constants";

const { deployMockContract: deployStubContract } = waffle;

/**
 * DEPLOYERS
 */
export async function deployStubBalanceSheet(deployer: Signer): Promise<MockContract> {
  const balanceSheet: MockContract = await deployStubContract(deployer, BalanceSheetArtifact.abi);
  await balanceSheet.mock.isBalanceSheet.returns(true);
  return balanceSheet;
}

export async function deployStubChainlinkOperator(deployer: Signer): Promise<MockContract> {
  const chainlinkOperator: MockContract = await deployStubContract(deployer, ChainlinkOperatorArtifact.abi);
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("WETH").returns(prices.oneHundredDollars);
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("DAI").returns(prices.oneDollar);
  return chainlinkOperator;
}

export async function deployStubCollateral(deployer: Signer): Promise<MockContract> {
  const collateral: MockContract = await deployStubErc20(deployer, "Wrapped ETH", "WETH", BigNumber.from(18));
  return collateral;
}

export async function deployStubCollateralPriceFeed(deployer: Signer): Promise<MockContract> {
  const collateralPriceFeed: MockContract = await deployStubContract(deployer, DummyPriceFeedArtifact.abi);
  await collateralPriceFeed.mock.decimals.returns(chainlinkPricePrecision);
  await collateralPriceFeed.mock.latestRoundData.returns(Zero, prices.oneHundredDollars, Zero, Zero, Zero);
  return collateralPriceFeed;
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
  return fintroller;
}

export async function deployStubFyToken(deployer: Signer): Promise<MockContract> {
  const fyToken: MockContract = await deployStubContract(deployer, FyTokenArtifact.abi);
  await fyToken.mock.isFyToken.returns(true);
  return fyToken;
}

export async function deployStubRedemptionPool(deployer: Signer): Promise<MockContract> {
  const redemptionPool: MockContract = await deployStubContract(deployer, RedemptionPoolArtifact.abi);
  await redemptionPool.mock.isRedemptionPool.returns(true);
  return redemptionPool;
}

export async function deployStubUnderlying(deployer: Signer): Promise<MockContract> {
  const underlying: MockContract = await deployStubErc20(deployer, "Dai Stablecoin", "DAI", BigNumber.from(18));
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
