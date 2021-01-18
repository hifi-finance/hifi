import BalanceSheetArtifact from "@hifi/protocol/artifacts/BalanceSheet.json";
import FintrollerArtifact from "@hifi/protocol/artifacts/Fintroller.json";
import FyTokenArtifact from "@hifi/protocol/artifacts/FyToken.json";
import RedemptionPoolArtifact from "@hifi/protocol/artifacts/RedemptionPool.json";
import UniswapV2PairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";

import { BalanceSheet } from "@hifi/protocol/typechain/BalanceSheet";
import { BigNumber } from "@ethersproject/bignumber";
import { Fintroller } from "@hifi/protocol/typechain/Fintroller";
import { FyToken } from "@hifi/protocol/typechain/FyToken";
import { RedemptionPool } from "@hifi/protocol/typechain/RedemptionPool";
import { Signer } from "@ethersproject/abstract-signer";
import { ethers, waffle } from "hardhat";

import GodModeArtifact from "../../artifacts/contracts/test/GodModeErc20.sol/GodModeErc20.json";
import HifiFlashSwapArtifact from "../../artifacts/contracts/HifiFlashSwap.sol/HifiFlashSwap.json";
import SimpleOracleArtifact from "../../artifacts/contracts/test/SimpleOracle.sol/SimpleOracle.json";

import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { HifiFlashSwap } from "../../typechain/HifiFlashSwap";
import { SimpleOracle } from "../../typechain/SimpleOracle";
import { UniswapV2Pair } from "../../types/contracts/UniswapV2Pair";
import { usdcConstants, wbtcConstants } from "../../helpers/constants";

const { deployContract } = waffle;

type IntegrationFixtureReturnType = {
  balanceSheet: BalanceSheet;
  fintroller: Fintroller;
  fyToken: FyToken;
  hifiFlashSwap: HifiFlashSwap;
  oracle: SimpleOracle;
  redemptionPool: RedemptionPool;
  usdc: GodModeErc20;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: GodModeErc20;
};

export async function integrationFixture(signers: Signer[]): Promise<IntegrationFixtureReturnType> {
  const deployer: Signer = signers[0];

  const oracle: SimpleOracle = <SimpleOracle>await deployContract(deployer, SimpleOracleArtifact, []);

  const fintroller: Fintroller = <Fintroller>await deployContract(deployer, FintrollerArtifact, []);
  await fintroller.connect(deployer).setOracle(oracle.address);

  const balanceSheet: BalanceSheet = <BalanceSheet>(
    await deployContract(deployer, BalanceSheetArtifact, [fintroller.address])
  );

  const usdc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, GodModeArtifact, [usdcConstants.name, usdcConstants.symbol, usdcConstants.decimals])
  );

  const wbtc: GodModeErc20 = <GodModeErc20>(
    await deployContract(deployer, GodModeArtifact, [wbtcConstants.name, wbtcConstants.symbol, wbtcConstants.decimals])
  );

  const name: string = "hfyUSDC (2021-04-30)";
  const symbol: string = "hfyUSDC-APR21";
  const expirationTime = BigNumber.from("1619816400");
  const fyToken: FyToken = <FyToken>(
    await deployContract(deployer, FyTokenArtifact, [
      name,
      symbol,
      expirationTime,
      fintroller.address,
      balanceSheet.address,
      usdc.address,
      wbtc.address,
    ])
  );

  const redemptionPoolAddress = await fyToken.redemptionPool();
  const redemptionPool = <RedemptionPool>(
    new ethers.Contract(redemptionPoolAddress, RedemptionPoolArtifact.abi, ethers.provider)
  );

  const uniswapV2Pair = <UniswapV2Pair>await deployContract(deployer, UniswapV2PairArtifact, []);
  await uniswapV2Pair.initialize(wbtc.address, usdc.address);

  const hifiFlashSwap: HifiFlashSwap = <HifiFlashSwap>(
    await deployContract(deployer, HifiFlashSwapArtifact, [balanceSheet.address, uniswapV2Pair.address])
  );

  return {
    balanceSheet,
    fintroller,
    fyToken,
    hifiFlashSwap,
    oracle,
    redemptionPool,
    usdc,
    uniswapV2Pair,
    wbtc,
  };
}
