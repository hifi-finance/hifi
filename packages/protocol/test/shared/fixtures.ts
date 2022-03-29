import type { Signer } from "@ethersproject/abstract-signer";
import {
  H_TOKEN_MATURITY_ONE_YEAR,
  H_TOKEN_MATURITY_THREE_MONTHS,
  NORMALIZED_USDC_PRICE,
  NORMALIZED_WBTC_PRICE,
  NORMALIZED_WETH_PRICE,
  USDC_PRICE_PRECISION_SCALAR,
  USDC_SYMBOL,
  WBTC_PRICE,
  WBTC_SYMBOL,
  WETH_SYMBOL,
} from "@hifi/constants";
import type { MockContract } from "ethereum-waffle";

import type { Fintroller } from "../../src/types/contracts/core/fintroller/Fintroller";
import type { ChainlinkOperator } from "../../src/types/contracts/oracles/ChainlinkOperator";
import type { SimplePriceFeed } from "../../src/types/contracts/oracles/SimplePriceFeed";
import type { GodModeBalanceSheet } from "../../src/types/contracts/test/GodModeBalanceSheet";
import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { GodModeHToken } from "../../src/types/contracts/test/GodModeHToken";
import type { GodModeOwnableUpgradeable } from "../../src/types/contracts/test/GodModeOwnableUpgradeable";
import {
  deployChainlinkOperator,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeHToken,
  deployOwnableUpgradeable,
  deployUsdc,
  deployUsdcPriceFeed,
  deployWbtc,
  deployWbtcPriceFeed,
} from "./deployers";
import {
  deployMockBalanceSheet,
  deployMockChainlinkOperator,
  deployMockFintroller,
  deployMockHToken,
  deployMockSimplePriceFeed,
  deployMockUsdc,
  deployMockWbtc,
  deployMockWeth,
} from "./mocks";

type IntegrationFixtureReturnType = {
  balanceSheet: GodModeBalanceSheet;
  fintroller: Fintroller;
  hTokens: GodModeHToken[];
  oracle: ChainlinkOperator;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const usdc: GodModeErc20 = await deployUsdc(deployer);
  const usdcPriceFeed: SimplePriceFeed = await deployUsdcPriceFeed(deployer);

  const wbtc: GodModeErc20 = await deployWbtc(deployer);
  const wbtcPriceFeed: SimplePriceFeed = await deployWbtcPriceFeed(deployer);

  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);

  const fintroller: Fintroller = await deployFintroller(deployer);
  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(fintroller.address, oracle.address);
  await balanceSheet.connect(deployer).setOracle(oracle.address);
  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    H_TOKEN_MATURITY_THREE_MONTHS,
    balanceSheet.address,
    fintroller.address,
    usdc.address,
  );

  return {
    balanceSheet,
    fintroller,
    hTokens: [hToken],
    oracle,
    usdc,
    usdcPriceFeed,
    wbtc,
    wbtcPriceFeed,
  };
}

type UnitFixtureBalanceSheetReturnType = {
  balanceSheet: GodModeBalanceSheet;
  fintroller: MockContract;
  hTokens: MockContract[];
  oracle: MockContract;
  usdc: MockContract;
  wbtc: MockContract;
  weth: MockContract;
};

export async function unitFixtureBalanceSheet(signers: Signer[]): Promise<UnitFixtureBalanceSheetReturnType> {
  const deployer: Signer = signers[0];

  const fintroller: MockContract = await deployMockFintroller(deployer);
  const usdc: MockContract = await deployMockUsdc(deployer);
  const wbtc: MockContract = await deployMockWbtc(deployer);
  const weth: MockContract = await deployMockWeth(deployer);

  const hToken1: MockContract = await deployMockHToken(deployer, H_TOKEN_MATURITY_THREE_MONTHS);
  await hToken1.mock.underlying.returns(usdc.address);
  await hToken1.mock.underlyingPrecisionScalar.returns(USDC_PRICE_PRECISION_SCALAR);

  const hToken2: MockContract = await deployMockHToken(deployer, H_TOKEN_MATURITY_ONE_YEAR);
  await hToken2.mock.underlying.returns(usdc.address);
  await hToken2.mock.underlyingPrecisionScalar.returns(USDC_PRICE_PRECISION_SCALAR);

  const oracle: MockContract = await deployMockChainlinkOperator(deployer);
  await oracle.mock.getNormalizedPrice.withArgs(USDC_SYMBOL).returns(NORMALIZED_USDC_PRICE);
  await oracle.mock.getNormalizedPrice.withArgs(WBTC_SYMBOL).returns(NORMALIZED_WBTC_PRICE);
  await oracle.mock.getNormalizedPrice.withArgs(WETH_SYMBOL).returns(NORMALIZED_WETH_PRICE);

  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(fintroller.address, oracle.address);
  return {
    balanceSheet,
    fintroller,
    hTokens: [hToken1, hToken2],
    oracle,
    usdc,
    wbtc,
    weth,
  };
}

type UnitFixtureChainlinkOperatorReturnType = {
  oracle: ChainlinkOperator;
  wbtc: MockContract;
  wbtcPriceFeed: MockContract;
};

export async function unitFixtureChainlinkOperator(signers: Signer[]): Promise<UnitFixtureChainlinkOperatorReturnType> {
  const deployer: Signer = signers[0];
  const wbtc: MockContract = await deployMockWbtc(deployer);
  const wbtcPriceFeed: MockContract = await deployMockSimplePriceFeed(deployer, WBTC_PRICE);
  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  return { oracle, wbtc, wbtcPriceFeed };
}

type UnitFixtureFintrollerReturnType = {
  fintroller: Fintroller;
  hTokens: MockContract[];
  wbtc: MockContract;
};

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const fintroller: Fintroller = await deployFintroller(deployer);
  const hToken: MockContract = await deployMockHToken(deployer, H_TOKEN_MATURITY_THREE_MONTHS);
  const wbtc: MockContract = await deployMockWbtc(deployer);
  return { fintroller, hTokens: [hToken], wbtc };
}

type UnitFixtureHTokenReturnType = {
  balanceSheet: MockContract;
  fintroller: MockContract;
  hTokens: GodModeHToken[];
  oracle: MockContract;
  usdc: MockContract;
};

export async function unitFixtureHToken(signers: Signer[]): Promise<UnitFixtureHTokenReturnType> {
  const deployer: Signer = signers[0];

  const oracle: MockContract = await deployMockChainlinkOperator(deployer);
  const balanceSheet: MockContract = await deployMockBalanceSheet(deployer);
  await balanceSheet.mock.oracle.returns(oracle.address);

  const fintroller: MockContract = await deployMockFintroller(deployer);

  const usdc: MockContract = await deployMockUsdc(deployer);
  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    H_TOKEN_MATURITY_THREE_MONTHS,
    balanceSheet.address,
    fintroller.address,
    usdc.address,
  );

  return { balanceSheet, fintroller, oracle, hTokens: [hToken], usdc };
}

type UnitFixtureOwnableUpgradeable = {
  ownableUpgradeable: GodModeOwnableUpgradeable;
};

export async function unitFixtureOwnableUpgradeable(): Promise<UnitFixtureOwnableUpgradeable> {
  const ownableUpgradeable: GodModeOwnableUpgradeable = await deployOwnableUpgradeable();
  return { ownableUpgradeable };
}
