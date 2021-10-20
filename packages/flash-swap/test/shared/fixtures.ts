import type { Signer } from "@ethersproject/abstract-signer";
import { keccak256 } from "@ethersproject/keccak256";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import type { BalanceSheetV1 } from "@hifi/protocol/dist/types/BalanceSheetV1";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/ChainlinkOperator";
import type { FintrollerV1 } from "@hifi/protocol/dist/types/FintrollerV1";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import { GodModeUniswapV2Pair__factory } from "../../src/types/factories/GodModeUniswapV2Pair__factory";
import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeUniswapV2Factory } from "../../src/types/GodModeUniswapV2Factory";
import type { HifiFlashUniswapV2 } from "../../src/types/HifiFlashUniswapV2";
import type { MaliciousPair } from "../../src/types/MaliciousPair";
import type { SimplePriceFeed } from "../../src/types/SimplePriceFeed";
import type { GodModeUniswapV2Pair } from "../../src/types/GodModeUniswapV2Pair";
import { deployGodModeErc20 } from "./deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  hToken: GodModeHToken;
  maliciousPair: MaliciousPair;
  uniswapV2Pair: GodModeUniswapV2Pair;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const wbtc: GodModeErc20 = await deployGodModeErc20(deployer, WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS);
  const usdc: GodModeErc20 = await deployGodModeErc20(deployer, USDC_NAME, USDC_SYMBOL, USDC_DECIMALS);

  const simplePriceFeedArtifact: Artifact = await artifacts.readArtifact("SimplePriceFeed");
  const wbtcPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await waffle.deployContract(deployer, simplePriceFeedArtifact, [])
  );
  const usdcPriceFeed: SimplePriceFeed = <SimplePriceFeed>(
    await waffle.deployContract(deployer, simplePriceFeedArtifact, [])
  );

  const chainlinkOperatorArtifact: Artifact = await artifacts.readArtifact("ChainlinkOperator");
  const oracle: ChainlinkOperator = <ChainlinkOperator>(
    await waffle.deployContract(deployer, chainlinkOperatorArtifact, [])
  );
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintrollerV1Artifact: Artifact = await artifacts.readArtifact("FintrollerV1");
  const fintroller: FintrollerV1 = <FintrollerV1>await waffle.deployContract(deployer, fintrollerV1Artifact, []);
  await fintroller.connect(deployer).initialize();

  const balanceSheetV1Artifact: Artifact = await artifacts.readArtifact("BalanceSheetV1");
  const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>(
    await waffle.deployContract(deployer, balanceSheetV1Artifact, [])
  );
  await balanceSheet.connect(deployer).initialize(fintroller.address, oracle.address);

  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await waffle.deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      balanceSheet.address,
      usdc.address,
    ])
  );

  const godModeUniswapV2FactoryArtifact: Artifact = await artifacts.readArtifact("GodModeUniswapV2Factory");
  const uniswapV2Factory: GodModeUniswapV2Factory = <GodModeUniswapV2Factory>(
    await waffle.deployContract(deployer, godModeUniswapV2FactoryArtifact, [await deployer.getAddress()])
  );
  await uniswapV2Factory.createPair(wbtc.address, usdc.address);
  const pairAddress: string = await uniswapV2Factory.allPairs(0);

  const godModeUniswapV2PairArtifact: Artifact = await artifacts.readArtifact("GodModeUniswapV2Pair");
  const uniswapV2Pair: GodModeUniswapV2Pair = GodModeUniswapV2Pair__factory.connect(pairAddress, deployer);

  const maliciousPairArtifact: Artifact = await artifacts.readArtifact("MaliciousPair");
  const maliciousPair: MaliciousPair = <MaliciousPair>(
    await waffle.deployContract(deployer, maliciousPairArtifact, [wbtc.address, usdc.address])
  );

  const hifiFlashUniswapV2Artifact: Artifact = await artifacts.readArtifact("HifiFlashUniswapV2");
  const uniV2PairInitCodeHash: string = keccak256(godModeUniswapV2PairArtifact.bytecode);
  const hifiFlashUniswapV2: HifiFlashUniswapV2 = <HifiFlashUniswapV2>(
    await waffle.deployContract(deployer, hifiFlashUniswapV2Artifact, [
      balanceSheet.address,
      uniswapV2Factory.address,
      uniV2PairInitCodeHash,
    ])
  );

  return {
    balanceSheet,
    fintroller,
    hifiFlashUniswapV2,
    hToken,
    maliciousPair,
    uniswapV2Pair,
    usdc,
    usdcPriceFeed,
    wbtc,
    wbtcPriceFeed,
  };
}
