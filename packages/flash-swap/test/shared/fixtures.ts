import type { Signer } from "@ethersproject/abstract-signer";
import { keccak256 } from "@ethersproject/keccak256";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import type { BalanceSheetV2 } from "@hifi/protocol/dist/types/BalanceSheetV2";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/ChainlinkOperator";
import type { Fintroller } from "@hifi/protocol/dist/types/Fintroller";
import { artifacts, waffle } from "hardhat";
import type { Artifact } from "hardhat/types";

import type { FlashUniswapV2 } from "../../src/types/FlashUniswapV2";
import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeUniswapV2Factory } from "../../src/types/GodModeUniswapV2Factory";
import type { GodModeUniswapV2Pair } from "../../src/types/GodModeUniswapV2Pair";
import type { MaliciousPair } from "../../src/types/MaliciousPair";
import type { SimplePriceFeed } from "../../src/types/SimplePriceFeed";
import { GodModeUniswapV2Pair__factory } from "../../src/types/factories/GodModeUniswapV2Pair__factory";
import { deployGodModeErc20 } from "./deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV2;
  fintroller: Fintroller;
  flashUniswapV2: FlashUniswapV2;
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

  const fintrollerArtifact: Artifact = await artifacts.readArtifact("Fintroller");
  const fintroller: Fintroller = <Fintroller>await waffle.deployContract(deployer, fintrollerArtifact, []);

  const balanceSheetV2Artifact: Artifact = await artifacts.readArtifact("BalanceSheetV2");
  const balanceSheet: BalanceSheetV2 = <BalanceSheetV2>(
    await waffle.deployContract(deployer, balanceSheetV2Artifact, [])
  );
  await balanceSheet.connect(deployer).initialize(fintroller.address, oracle.address);

  const godModeHTokenArtifact: Artifact = await artifacts.readArtifact("GodModeHToken");
  const hToken: GodModeHToken = <GodModeHToken>(
    await waffle.deployContract(deployer, godModeHTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY_ONE_YEAR),
      getHTokenSymbol(H_TOKEN_MATURITY_ONE_YEAR),
      H_TOKEN_MATURITY_ONE_YEAR,
      balanceSheet.address,
      fintroller.address,
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

  const uniV2PairInitCodeHash: string = keccak256(godModeUniswapV2PairArtifact.bytecode);

  const flashUniswapV2Artifact: Artifact = await artifacts.readArtifact("FlashUniswapV2");
  const flashUniswapV2: FlashUniswapV2 = <FlashUniswapV2>(
    await waffle.deployContract(deployer, flashUniswapV2Artifact, [
      balanceSheet.address,
      uniswapV2Factory.address,
      uniV2PairInitCodeHash,
    ])
  );

  return {
    balanceSheet,
    fintroller,
    flashUniswapV2,
    hToken,
    maliciousPair,
    uniswapV2Pair,
    usdc,
    usdcPriceFeed,
    wbtc,
    wbtcPriceFeed,
  };
}
