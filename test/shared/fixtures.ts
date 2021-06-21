import { Signer } from "@ethersproject/abstract-signer";
import balanceSheetArtifact from "@hifi/protocol/artifacts/BalanceSheet.json";
import chainlinkOperatorArtifact from "@hifi/protocol/artifacts/ChainlinkOperator.json";
import fintrollerArtifact from "@hifi/protocol/artifacts/Fintroller.json";
import fyTokenArtifact from "@hifi/protocol/artifacts/FyToken.json";
import redemptionPoolArtifact from "@hifi/protocol/artifacts/RedemptionPool.json";
import { BalanceSheet } from "@hifi/protocol/typechain/BalanceSheet";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { Fintroller } from "@hifi/protocol/typechain/Fintroller";
import { FyToken } from "@hifi/protocol/typechain/FyToken";
import { RedemptionPool } from "@hifi/protocol/typechain/RedemptionPool";
import uniswapV2PairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";
import hre from "hardhat";
import { Artifact } from "hardhat/types";

import { FY_TOKEN_EXPIRATION_TIME } from "../../helpers/constants";
import { USDC_DECIMALS, USDC_NAME, USDC_SYMBOL, WBTC_DECIMALS, WBTC_NAME, WBTC_SYMBOL } from "../../helpers/constants";
import { getFyTokenName, getFyTokenSymbol } from "../../helpers/contracts";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { HifiFlashSwap } from "../../typechain/HifiFlashSwap";
import { SimplePriceFeed } from "../../typechain/SimplePriceFeed";
import { UniswapV2Pair } from "../../types/contracts/UniswapV2Pair";

const { deployContract } = hre.waffle;

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheet;
  fintroller: Fintroller;
  fyToken: FyToken;
  hifiFlashSwap: HifiFlashSwap;
  redemptionPool: RedemptionPool;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const godModeErc20Artifact: Artifact = await hre.artifacts.readArtifact("GodModeErc20");
  const wbtc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [WBTC_NAME, WBTC_SYMBOL, WBTC_DECIMALS])
  );
  const simplePriceFeedArtifact: Artifact = await hre.artifacts.readArtifact("SimplePriceFeed");
  const wbtcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);

  const usdc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, godModeErc20Artifact, [USDC_NAME, USDC_SYMBOL, USDC_DECIMALS])
  );
  const usdcPriceFeed: SimplePriceFeed = <SimplePriceFeed>await deployContract(deployer, simplePriceFeedArtifact, []);

  const oracle: ChainlinkOperator = <ChainlinkOperator>await deployContract(deployer, chainlinkOperatorArtifact, []);
  await oracle.setFeed(wbtc.address, wbtcPriceFeed.address);
  await oracle.setFeed(usdc.address, usdcPriceFeed.address);

  const fintroller: Fintroller = <Fintroller>await deployContract(deployer, fintrollerArtifact, []);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: BalanceSheet = <BalanceSheet>(
    await deployContract(deployer, balanceSheetArtifact, [fintroller.address])
  );

  const fyToken: FyToken = <FyToken>(
    await deployContract(deployer, fyTokenArtifact, [
      getFyTokenName(FY_TOKEN_EXPIRATION_TIME),
      getFyTokenSymbol(FY_TOKEN_EXPIRATION_TIME),
      FY_TOKEN_EXPIRATION_TIME,
      fintroller.address,
      balanceSheet.address,
      usdc.address,
      wbtc.address,
    ])
  );

  const redemptionPoolAddress = await fyToken.redemptionPool();
  const redemptionPool = <RedemptionPool>(
    new hre.ethers.Contract(redemptionPoolAddress, redemptionPoolArtifact.abi, hre.ethers.provider)
  );

  const uniswapV2Pair = <UniswapV2Pair>await deployContract(deployer, uniswapV2PairArtifact, []);
  await uniswapV2Pair.initialize(wbtc.address, usdc.address);

  const hifiFlashSwapArtifact: Artifact = await hre.artifacts.readArtifact("HifiFlashSwap");
  const hifiFlashSwap: HifiFlashSwap = <HifiFlashSwap>(
    await deployContract(deployer, hifiFlashSwapArtifact, [balanceSheet.address, uniswapV2Pair.address])
  );

  return {
    balanceSheet,
    fintroller,
    fyToken,
    hifiFlashSwap,
    redemptionPool,
    usdc,
    usdcPriceFeed,
    uniswapV2Pair,
    wbtc,
    wbtcPriceFeed,
  };
}
