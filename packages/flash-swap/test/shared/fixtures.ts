import { Signer } from "@ethersproject/abstract-signer";
import { keccak256 } from "@ethersproject/keccak256";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "@hifi/constants";
import { getHTokenName, getHTokenSymbol } from "@hifi/helpers";
import balanceSheetV1Artifact from "@hifi/protocol/artifacts/BalanceSheetV1.json";
import chainlinkOperatorArtifact from "@hifi/protocol/artifacts/ChainlinkOperator.json";
import fintrollerV1Artifact from "@hifi/protocol/artifacts/FintrollerV1.json";
import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { UniswapV2Pair__factory } from "../../typechain/factories/UniswapV2Pair__factory";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { HifiFlashUniswapV2 } from "../../typechain/HifiFlashUniswapV2";
import { MaliciousPair } from "../../typechain/MaliciousPair";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import { UniswapV2Factory } from "../../typechain/UniswapV2Factory";
import { UniswapV2Pair } from "../../typechain/UniswapV2Pair";
import { deployGodModeErc20 } from "./deployers";

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  hToken: GodModeHToken;
  maliciousPair: MaliciousPair;
  uniswapV2Pair: UniswapV2Pair;
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

  const oracle: ChainlinkOperator = <ChainlinkOperator>(
    await waffle.deployContract(deployer, chainlinkOperatorArtifact, [])
  );
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintroller: FintrollerV1 = <FintrollerV1>await waffle.deployContract(deployer, fintrollerV1Artifact, []);
  await fintroller.connect(deployer).initialize();

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

  const uniswapV2FactoryArtifact: Artifact = await artifacts.readArtifact("UniswapV2Factory");
  const uniswapV2Factory: UniswapV2Factory = <UniswapV2Factory>(
    await waffle.deployContract(deployer, uniswapV2FactoryArtifact, [await deployer.getAddress()])
  );
  await uniswapV2Factory.createPair(wbtc.address, usdc.address);
  const pairAddress: string = await uniswapV2Factory.allPairs(0);

  const uniswapV2PairArtifact: Artifact = await artifacts.readArtifact("UniswapV2Pair");
  const uniswapV2Pair: UniswapV2Pair = UniswapV2Pair__factory.connect(pairAddress, deployer);

  const maliciousPairArtifact: Artifact = await artifacts.readArtifact("MaliciousPair");
  const maliciousPair: MaliciousPair = <MaliciousPair>(
    await waffle.deployContract(deployer, maliciousPairArtifact, [wbtc.address, usdc.address])
  );

  const hifiFlashUniswapV2Artifact: Artifact = await artifacts.readArtifact("HifiFlashUniswapV2");
  const uniV2PairInitCodeHash: string = keccak256(uniswapV2PairArtifact.bytecode);
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
