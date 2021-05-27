import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { MockContract } from "ethereum-waffle";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { balanceSheetConstants, chainlinkPricePrecision } from "../../helpers/constants";
import { price } from "../../helpers/numbers";

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
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("WETH").returns(price("100"));
  await chainlinkOperator.mock.getAdjustedPrice.withArgs("USDC").returns(price("1"));
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
  await collateralPriceFeed.mock.latestRoundData.returns(Zero, price("100"), Zero, Zero, Zero);
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

export async function deployStubHToken(deployer: Signer): Promise<MockContract> {
  const hTokenArtifact: Artifact = await hre.artifacts.readArtifact("HToken");
  const hToken: MockContract = await deployStubContract(deployer, hTokenArtifact.abi);
  await hToken.mock.isHToken.returns(true);
  return hToken;
}

export async function deployStubRedemptionPool(deployer: Signer): Promise<MockContract> {
  const redemptionPoolArtifact: Artifact = await hre.artifacts.readArtifact("RedemptionPool");
  const redemptionPool: MockContract = await deployStubContract(deployer, redemptionPoolArtifact.abi);
  await redemptionPool.mock.isRedemptionPool.returns(true);
  return redemptionPool;
}

export async function deployStubUnderlying(deployer: Signer): Promise<MockContract> {
  const underlying: MockContract = await deployStubErc20(deployer, "USD Coin", "USDC", BigNumber.from(6));
  return underlying;
}

/**
 * FUNCTION STUBS
 */
export async function stubGetVault(
  this: Mocha.Context,
  hTokenAddress: string,
  account: string,
  debt: BigNumber,
  freeCollateral: BigNumber,
  lockedCollateral: BigNumber,
  isOpen: boolean,
): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(hTokenAddress, account)
    .returns({ debt, freeCollateral, lockedCollateral, isOpen });
}

export async function stubIsVaultOpen(this: Mocha.Context, hTokenAddress: string, account: string): Promise<void> {
  await this.stubs.balanceSheet.mock.getVault
    .withArgs(hTokenAddress, account)
    .returns(balanceSheetConstants.defaultVault);
  await this.stubs.balanceSheet.mock.isVaultOpen.withArgs(hTokenAddress, account).returns(true);
}

export async function stubVaultFreeCollateral(
  this: Mocha.Context,
  hTokenAddress: string,
  account: string,
  freeCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    hTokenAddress,
    account,
    balanceSheetConstants.defaultVault.debt,
    freeCollateral,
    balanceSheetConstants.defaultVault.lockedCollateral,
    balanceSheetConstants.defaultVault.isOpen,
  );
}

export async function stubVaultLockedCollateral(
  this: Mocha.Context,
  hTokenAddress: string,
  account: string,
  lockedCollateral: BigNumber,
): Promise<void> {
  await stubGetVault.call(
    this,
    hTokenAddress,
    account,
    balanceSheetConstants.defaultVault.debt,
    balanceSheetConstants.defaultVault.freeCollateral,
    lockedCollateral,
    balanceSheetConstants.defaultVault.isOpen,
  );
}
