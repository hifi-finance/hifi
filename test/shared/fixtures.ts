import { Signer } from "@ethersproject/abstract-signer";
import { MockContract } from "ethereum-waffle";

import {
  H_TOKEN_EXPIRATION_TIMES,
  NORMALIZED_USDC_PRICE,
  NORMALIZED_WBTC_PRICE,
  NORMALIZED_WETH_PRICE,
  USDC_PRECISION_SCALAR,
  USDC_SYMBOL,
  WBTC_PRICE,
  WBTC_SYMBOL,
  WETH_SYMBOL,
} from "../../helpers/constants";
import { FintrollerV1 } from "../../typechain";
import { ChainlinkOperator } from "../../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../../typechain/Erc20Mintable";
import { GodModeBalanceSheet } from "../../typechain/GodModeBalanceSheet";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import {
  deployChainlinkOperator,
  deployFintroller,
  deployGodModeBalanceSheet,
  deployGodModeHToken,
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
  fintroller: FintrollerV1;
  hTokens: GodModeHToken[];
  oracle: ChainlinkOperator;
  usdc: Erc20Mintable;
  usdcPriceFeed: SimplePriceFeed;
  wbtc: Erc20Mintable;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const usdc: Erc20Mintable = await deployUsdc(deployer);
  const usdcPriceFeed: SimplePriceFeed = await deployUsdcPriceFeed(deployer);

  const wbtc: Erc20Mintable = await deployWbtc(deployer);
  const wbtcPriceFeed: SimplePriceFeed = await deployWbtcPriceFeed(deployer);

  const oracle: ChainlinkOperator = await deployChainlinkOperator(deployer);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);

  const fintroller: FintrollerV1 = await deployFintroller();
  const balanceSheet: GodModeBalanceSheet = await deployGodModeBalanceSheet(fintroller.address, oracle.address);
  await balanceSheet.connect(deployer).setOracle(oracle.address);
  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    H_TOKEN_EXPIRATION_TIMES[0],
    balanceSheet.address,
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

  const hToken1: MockContract = await deployMockHToken(deployer, H_TOKEN_EXPIRATION_TIMES[0]);
  await hToken1.mock.underlying.returns(usdc.address);
  await hToken1.mock.underlyingPrecisionScalar.returns(USDC_PRECISION_SCALAR);

  const hToken2: MockContract = await deployMockHToken(deployer, H_TOKEN_EXPIRATION_TIMES[1]);
  await hToken2.mock.underlying.returns(usdc.address);
  await hToken2.mock.underlyingPrecisionScalar.returns(USDC_PRECISION_SCALAR);

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
  fintroller: FintrollerV1;
  hTokens: MockContract[];
  wbtc: MockContract;
};

export async function unitFixtureFintroller(signers: Signer[]): Promise<UnitFixtureFintrollerReturnType> {
  const deployer: Signer = signers[0];
  const fintroller: FintrollerV1 = await deployFintroller();
  const hToken: MockContract = await deployMockHToken(deployer, H_TOKEN_EXPIRATION_TIMES[0]);
  const wbtc: MockContract = await deployMockWbtc(deployer);
  return { fintroller, hTokens: [hToken], wbtc };
}

type UnitFixtureHTokenReturnType = {
  balanceSheet: MockContract;
  hTokens: GodModeHToken[];
  oracle: MockContract;
  usdc: MockContract;
};

export async function unitFixtureHToken(signers: Signer[]): Promise<UnitFixtureHTokenReturnType> {
  const deployer: Signer = signers[0];

  const oracle: MockContract = await deployMockChainlinkOperator(deployer);
  const balanceSheet: MockContract = await deployMockBalanceSheet(deployer);
  await balanceSheet.mock.oracle.returns(oracle.address);

  const usdc: MockContract = await deployMockUsdc(deployer);
  const hToken: GodModeHToken = await deployGodModeHToken(
    deployer,
    H_TOKEN_EXPIRATION_TIMES[0],
    balanceSheet.address,
    usdc.address,
  );

  return { balanceSheet, oracle, hTokens: [hToken], usdc };
}
