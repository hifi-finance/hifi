import { BigNumber } from "@ethersproject/bignumber";
import { Signer } from "@ethersproject/abstract-signer";
import { TransactionRequest } from "@ethersproject/providers";
import { waffle } from "hardhat";

import ChainlinkOperatorArtifact from "../artifacts/contracts/oracles/ChainlinkOperator.sol/ChainlinkOperator.json";
import DummyPriceFeedArtifact from "../artifacts/contracts/test/DummyPriceFeed.sol/DummyPriceFeed.json";
import Erc20MintableArtifact from "../artifacts/contracts/test/Erc20Mintable.sol/Erc20Mintable.json";
import FintrollerArtifact from "../artifacts/contracts/Fintroller.sol/Fintroller.json";
import FyTokenArtifact from "../artifacts/contracts/FyToken.sol/FyToken.json";
import GodModeBalanceSheetArtifact from "../artifacts/contracts/test/GodModeBalanceSheet.sol/GodModeBalanceSheet.json";
import GodModeFyTokenArtifact from "../artifacts/contracts/test/GodModeFyToken.sol/GodModeFyToken.json";
import GodModeRedemptionPoolArtifact from "../artifacts/contracts/test/GodModRedemptionPool.sol/GodModeRedemptionPool.json";

import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { DummyPriceFeed } from "../typechain/DummyPriceFeed";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { FyToken } from "../typechain/FyToken";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeFyToken } from "../typechain/GodModeFyToken";
import { fyTokenConstants, gasLimits, prices } from "../helpers/constants";

const { deployContract } = waffle;
const overrideOptions: TransactionRequest = {
  gasLimit: process.env.CODE_COVERAGE
    ? gasLimits.coverage.deployContractGasLimit
    : gasLimits.hardhat.deployContractGasLimit,
};

export async function deployChainlinkOperator(deployer: Signer): Promise<ChainlinkOperator> {
  const chainlinkOperator: ChainlinkOperator = <ChainlinkOperator>(
    await deployContract(deployer, ChainlinkOperatorArtifact, [], overrideOptions)
  );
  return chainlinkOperator;
}

export async function deployCollateral(deployer: Signer): Promise<Erc20Mintable> {
  const collateral: Erc20Mintable = <Erc20Mintable>(
    await deployContract(deployer, Erc20MintableArtifact, ["Wrapped ETH", "WETH", BigNumber.from(18)], overrideOptions)
  );
  return collateral;
}

export async function deployCollateralPriceFeed(deployer: Signer): Promise<DummyPriceFeed> {
  const collateralPriceFeed: DummyPriceFeed = <DummyPriceFeed>(
    await deployContract(deployer, DummyPriceFeedArtifact, ["WETH/USD"], overrideOptions)
  );
  await collateralPriceFeed.setPrice(prices.oneHundredDollars);
  return collateralPriceFeed;
}

export async function deployFintroller(deployer: Signer): Promise<Fintroller> {
  const fintroller: Fintroller = <Fintroller>await deployContract(deployer, FintrollerArtifact, [], overrideOptions);
  return fintroller;
}

export async function deployFyToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<FyToken> {
  const fyToken: FyToken = <FyToken>(
    await deployContract(
      deployer,
      FyTokenArtifact,
      [
        fyTokenConstants.name,
        fyTokenConstants.symbol,
        expirationTime,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      overrideOptions,
    )
  );
  return fyToken;
}

export async function deployGodModeBalanceSheet(
  deployer: Signer,
  fintrollerAddress: string,
): Promise<GodModeBalanceSheet> {
  const balanceSheet: GodModeBalanceSheet = <GodModeBalanceSheet>(
    await deployContract(deployer, GodModeBalanceSheetArtifact, [fintrollerAddress], overrideOptions)
  );
  return balanceSheet;
}

export async function deployGodModeFyToken(
  deployer: Signer,
  expirationTime: BigNumber,
  fintrollerAddress: string,
  balanceSheetAddress: string,
  underlyingAddress: string,
  collateralAddress: string,
): Promise<GodModeFyToken> {
  const fyToken: GodModeFyToken = <GodModeFyToken>(
    await deployContract(
      deployer,
      GodModeFyTokenArtifact,
      [
        fyTokenConstants.name,
        fyTokenConstants.symbol,
        fyTokenConstants.expirationTime,
        fintrollerAddress,
        balanceSheetAddress,
        underlyingAddress,
        collateralAddress,
      ],
      overrideOptions,
    )
  );
  return fyToken;
}

export async function deployGodModeRedemptionPool(
  deployer: Signer,
  fintrollerAddress: string,
  fyTokenAddress: string,
): Promise<GodModeRedemptionPool> {
  const redemptionPool: GodModeRedemptionPool = <GodModeRedemptionPool>(
    await deployContract(deployer, GodModeRedemptionPoolArtifact, [fintrollerAddress, fyTokenAddress], overrideOptions)
  );
  return redemptionPool;
}

export async function deployUnderlying(deployer: Signer): Promise<Erc20Mintable> {
  const underlying: Erc20Mintable = <Erc20Mintable>(
    await deployContract(
      deployer,
      Erc20MintableArtifact,
      ["Dai Stablecoin", "DAI", BigNumber.from(18)],
      overrideOptions,
    )
  );
  return underlying;
}

export async function deployUnderlyingPriceFeed(deployer: Signer): Promise<DummyPriceFeed> {
  const underlyingPriceFeed: DummyPriceFeed = <DummyPriceFeed>(
    await deployContract(deployer, DummyPriceFeedArtifact, ["DAI/USD"], overrideOptions)
  );
  await underlyingPriceFeed.setPrice(prices.oneDollar);
  return underlyingPriceFeed;
}
