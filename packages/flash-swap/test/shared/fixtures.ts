import { Signer } from "@ethersproject/abstract-signer";
import balanceSheetV1Artifact from "@hifi/protocol/artifacts/BalanceSheetV1.json";
import chainlinkOperatorArtifact from "@hifi/protocol/artifacts/ChainlinkOperator.json";
import fintrollerV1Artifact from "@hifi/protocol/artifacts/FintrollerV1.json";
import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import {
  H_TOKEN_MATURITY_ONE_YEAR,
  USDC_DECIMALS,
  USDC_NAME,
  USDC_SYMBOL,
  WBTC_DECIMALS,
  WBTC_NAME,
  WBTC_SYMBOL,
} from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { HifiFlashUniswapV2 } from "../../typechain/HifiFlashUniswapV2";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import { deployGodModeErc20 } from "./deployers";
import { Contract, utils } from "ethers";
import { UniswapV2Factory } from "../../typechain/UniswapV2Factory";
import { UniswapV2Pair } from "../../typechain";

const { deployContract } = waffle;

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  hToken: GodModeHToken;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const wbtc: GodModeErc20 = await deployGodModeErc20(deployer, WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS);
  const usdc: GodModeErc20 = await deployGodModeErc20(deployer, USDC_NAME, USDC_SYMBOL, USDC_DECIMALS);

  const simplePriceFeedArtifact: Artifact = await artifacts.readArtifact("SimplePriceFeed");
  const wbtcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);
  const usdcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);

  const oracle: ChainlinkOperator = <ChainlinkOperator>await deployContract(deployer, chainlinkOperatorArtifact, []);
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintroller: FintrollerV1 = <FintrollerV1>await deployContract(deployer, fintrollerV1Artifact, []);
  await fintroller.connect(deployer).initialize();

  const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>await deployContract(deployer, balanceSheetV1Artifact, []);
  await balanceSheet.connect(deployer).initialize(fintroller.address, oracle.address);

  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      balanceSheet.address,
      usdc.address,
    ])
  );

  const uniswapV2FactoryArtifact: Artifact = await artifacts.readArtifact("UniswapV2Factory");
  const uniswapV2Factory: UniswapV2Factory = <UniswapV2Factory>(
    await deployContract(deployer, uniswapV2FactoryArtifact, [await deployer.getAddress()])
  );
  await uniswapV2Factory.createPair(usdc.address, wbtc.address);
  const pairAddress = await uniswapV2Factory.allPairs(0);

  const uniswapV2PairArtifact: Artifact = await artifacts.readArtifact("UniswapV2Pair");
  const uniswapV2Pair = new Contract(pairAddress, uniswapV2PairArtifact.abi, deployer) as UniswapV2Pair;

  const hifiFlashUniswapV2Artifact: Artifact = await artifacts.readArtifact("HifiFlashUniswapV2");
  const hifiFlashUniswapV2: HifiFlashUniswapV2 = <HifiFlashUniswapV2>(
    await deployContract(deployer, hifiFlashUniswapV2Artifact, [
      balanceSheet.address,
      uniswapV2Factory.address,
      utils.keccak256(uniswapV2PairArtifact.bytecode),
    ])
  );

  return {
    balanceSheet,
    fintroller,
    hToken,
    hifiFlashUniswapV2,
    usdc,
    usdcPriceFeed,
    uniswapV2Pair,
    wbtc,
    wbtcPriceFeed,
  };
}
