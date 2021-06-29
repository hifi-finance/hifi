import { Signer } from "@ethersproject/abstract-signer";
import balanceSheetV1Artifact from "@hifi/protocol/artifacts/BalanceSheetV1.json";
import chainlinkOperatorArtifact from "@hifi/protocol/artifacts/ChainlinkOperator.json";
import fintrollerV1Artifact from "@hifi/protocol/artifacts/FintrollerV1.json";
import hTokenArtifact from "@hifi/protocol/artifacts/HToken.json";
import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { HToken } from "@hifi/protocol/typechain/HToken";
import uniswapV2PairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import { artifacts, waffle } from "hardhat";
import { Artifact } from "hardhat/types";

import { H_TOKEN_MATURITY } from "../../helpers/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "../../helpers/constants";
import { getHTokenName, getHTokenSymbol } from "../../helpers/contracts";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { HifiFlashUniswapV2 } from "../../typechain/HifiFlashUniswapV2";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import { UniswapV2Pair } from "../../types/contracts/UniswapV2Pair";

const { deployContract } = waffle;

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  hToken: HToken;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const godModeErc20Artifact: Artifact = await artifacts.readArtifact("GodModeErc20");
  const wbtc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS])
  );
  const simplePriceFeedArtifact: Artifact = await artifacts.readArtifact("SimplePriceFeed");
  const wbtcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);

  const usdc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS])
  );
  const usdcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);

  const oracle: ChainlinkOperator = <ChainlinkOperator>await deployContract(deployer, chainlinkOperatorArtifact, []);
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintroller: FintrollerV1 = <FintrollerV1>await deployContract(deployer, fintrollerV1Artifact, []);
  await fintroller.connect(deployer).initialize();

  const balanceSheet: BalanceSheetV1 = <BalanceSheetV1>await deployContract(deployer, balanceSheetV1Artifact, []);
  await balanceSheet.connect(deployer).initialize(fintroller.address, oracle.address);

  const hToken: HToken = <HToken>(
    await deployContract(deployer, hTokenArtifact, [
      getHTokenName(H_TOKEN_MATURITY),
      getHTokenSymbol(H_TOKEN_MATURITY),
      H_TOKEN_MATURITY,
      balanceSheet.address,
      usdc.address,
    ])
  );

  const uniswapV2Pair = <UniswapV2Pair>await deployContract(deployer, uniswapV2PairArtifact, []);
  await uniswapV2Pair.initialize(wbtc.address, usdc.address);

  const hifiFlashUniswapV2Artifact: Artifact = await artifacts.readArtifact("HifiFlashUniswapV2");
  const hifiFlashUniswapV2: HifiFlashUniswapV2 = <HifiFlashUniswapV2>(
    await deployContract(deployer, hifiFlashUniswapV2Artifact, [
      balanceSheet.address,
      usdc.address,
      [uniswapV2Pair.address],
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
