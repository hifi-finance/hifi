import hre from "hardhat";
import { Artifact } from "hardhat/types";
import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";
import { Zero } from "@ethersproject/constants";

import { balanceSheetConstants, chainlinkPricePrecision, prices } from "../../helpers/constants";

const { deployMockContract: deployStubContract } = hre.waffle;

/**
 * DEPLOYERS
 */
export async function deployStubBalanceSheet(deployer: Signer): Promise<MockContract> {
  const balanceSheetArtifact: Artifact = await hre.artifacts.readArtifact("BalanceSheet");
  const balanceSheet: MockContract = await deployStubContract(deployer, balanceSheetArtifact.abi);
  await balanceSheet.mock.isBalanceSheet.returns(true);
  return balanceSheet;
}

export async function deployStubChainlinkOperator(deployer: Signer): Promise<MockContract> {
  const chainlinkOperatorArtifact: Artifact = await hre.artifacts.readArtifact("ChainlinkOperator");
  const chainlinkOperator: MockContract = await deployStubContract(deployer, chainlinkOperatorArtifact.abi);
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("WETH").returns(prices.oneHundredDollars);
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("DAI").returns(prices.oneDollar);
  return chainlinkOperator;
}

export async function deployStubCollateral(deployer: Signer): Promise<MockContract> {
  const collateral: MockContract = await deployStubErc20(deployer, "Wrapped ETH", "WETH", BigNumber.from(18));
  return collateral;
}

export async function deployStubCollateralPriceFeed(deployer: Signer): Promise<MockContract> {
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const collateralPriceFeed: MockContract = await deployStubContract(deployer, simplePriceFeedArtifact.abi);
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
  const erc20Artifact: Artifact = await hre.artifacts.readArtifact("Erc20");
  const erc20: MockContract = await deployStubContract(deployer, erc20Artifact.abi);
  await erc20.mock.name.returns(name);
  await erc20.mock.symbol.returns(symbol);
  await erc20.mock.decimals.returns(decimals);
  await erc20.mock.totalSupply.returns(Zero);
  return erc20;
}

export async function deployStubFintroller(deployer: Signer): Promise<MockContract> {
  const fintrollerArtifact: Artifact = await hre.artifacts.readArtifact("Fintroller");
  const fintroller: MockContract = await deployStubContract(deployer, fintrollerArtifact.abi);
  await fintroller.mock.isFintroller.returns(true);
  return fintroller;
}

export async function deployStubFyToken(deployer: Signer): Promise<MockContract> {
  const fyTokenArtifact: Artifact = await hre.artifacts.readArtifact("FyToken");
  const fyToken: MockContract = await deployStubContract(deployer, fyTokenArtifact.abi);
  await fyToken.mock.isFyToken.returns(true);
  return fyToken;
}

export async function deployStubRedemptionPool(deployer: Signer): Promise<MockContract> {
  const redemptionPoolArtifact: Artifact = await hre.artifacts.readArtifact("RedemptionPool");
  const redemptionPool: MockContract = await deployStubContract(deployer, redemptionPoolArtifact.abi);
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
