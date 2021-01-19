import BalanceSheetArtifact from "hifi-protocol/artifacts/BalanceSheet.json";
import FyTokenArtifact from "hifi-protocol/artifacts/FyToken.json";
import UniswapV2PairArtifact from "@uniswap/v2-core/build/UniswapV2Pair.json";

import { BalanceSheet } from "hifi-protocol/typechain/BalanceSheet";
import { BigNumber } from "@ethersproject/bignumber";
import { FyToken } from "hifi-protocol/typechain/FyToken";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers } from "hardhat";

import DummyPriceFeedArtifact from "../artifacts/contracts/test/DummyPriceFeed.sol/DummyPriceFeed.json";
import GodModeErc20Artifact from "../artifacts/contracts/test/GodModeErc20.sol/GodModeErc20.json";

import { DummyPriceFeed } from "../typechain/DummyPriceFeed";
import { GodModeErc20 } from "../typechain/GodModeErc20";
import { UniswapV2Pair } from "../types/contracts/UniswapV2Pair";
import {
  getPartialWbtcAmount,
  getWholeFyUsdcAmount,
  getWholeOraclePrice,
  getWholeUsdcAmount,
  getWholeWbtcAmount,
} from "../helpers/math";

const fyUsdc10k: BigNumber = getWholeFyUsdcAmount(10000);
const p12dot5k: BigNumber = getWholeOraclePrice(12500);
const p20k: BigNumber = getWholeOraclePrice(20000);
const usdc1dot25m = getWholeUsdcAmount(1250000);
const wbtcdot88: BigNumber = getPartialWbtcAmount(100).mul(88);
const wbtc100 = getWholeWbtcAmount(100);

function getEnvVar(key: string): string {
  if (!process.env[key]) {
    throw new Error(`Please set ${key} as an env variable`);
  }
  return process.env[key] || "";
}

/// Meant to be used on a testnet.
///
/// Requirements:
///   1. The initial balances in the UniswapV2Pair contract are (0 WBTC, 0 USDC).
///   2. The user has enough WBTC and USDC.
///   3. The user has approved the WBTC and USDC allowances.
async function main(): Promise<void> {
  const signers: SignerWithAddress[] = await ethers.getSigners();

  const balanceSheet: BalanceSheet = <BalanceSheet>(
    new ethers.Contract(getEnvVar("BALANCE_SHEET_ADDRESS"), BalanceSheetArtifact.abi, signers[0])
  );
  const fyToken: FyToken = <FyToken>new ethers.Contract(getEnvVar("FY_TOKEN_ADDRESS"), FyTokenArtifact.abi, signers[0]);
  const uniV2WbtcUsdc: UniswapV2Pair = <UniswapV2Pair>(
    new ethers.Contract(getEnvVar("UNI_V2_WBTC_USDC_ADDRESS"), UniswapV2PairArtifact.abi, signers[0])
  );
  const usdc: GodModeErc20 = <GodModeErc20>(
    new ethers.Contract(getEnvVar("USDC_ADDRESS"), GodModeErc20Artifact.abi, signers[0])
  );
  const wbtc: GodModeErc20 = <GodModeErc20>(
    new ethers.Contract(getEnvVar("WBTC_ADDRESS"), GodModeErc20Artifact.abi, signers[0])
  );
  const wbtcPriceFeed: DummyPriceFeed = <DummyPriceFeed>(
    new ethers.Contract(getEnvVar("WBTC_PRICE_FEED_ADDRESS"), DummyPriceFeedArtifact.abi, signers[0])
  );

  // Mint 100 WBTC to the UniswapV2Pair contract.
  console.log("Minting 100 WBTC ...");
  await wbtc.mint(uniV2WbtcUsdc.address, wbtc100);
  console.log("✨ Just minted 100 WBTC to the UniswapV2Pair contract");
  console.log();

  // Mint 1.25m USDC to the UniswapV2Pair contract.
  console.log("Minting 1.25m USDC ...");
  await usdc.mint(uniV2WbtcUsdc.address, usdc1dot25m);
  console.log("✨ Just minted 1.25m USDC to the UniswapV2Pair contract");
  console.log();

  // Synchronise the balances in the UniswapV2Pair contract.
  console.log("Syncing the UniswapV2Pair contract ...");
  await uniV2WbtcUsdc.sync();
  console.log("✨ Just synced the UniswapV2Pair contract");
  console.log();

  // Set the oracle price to 1 WBTC = $20k.
  console.log("Setting the WBTC price ...");
  await wbtcPriceFeed.setPrice(p20k);
  console.log("✨ Just set the oracle price to 1 WBTC = $20k");
  console.log();

  // Deposit 0.88 WBTC in the BalanceSheet.
  console.log("Depositing collateral ...");
  await balanceSheet.depositCollateral(fyToken.address, wbtcdot88);
  console.log("✨ Just deposited 1 WBTC in the BalanceSheet");
  console.log();

  // Lock 0.88 WBTC in the BalanceSheet.
  console.log("Locking collateral ...");
  await balanceSheet.lockCollateral(fyToken.address, wbtcdot88);
  console.log("✨ Just locked 1 WBTC in the BalanceSheet");
  console.log();

  // Borrow 10k USDC.
  console.log("Borrowing fyUSDC ...");
  await fyToken.borrow(fyUsdc10k);
  console.log("✨ Just borrowed 10k fyUSDC");
  console.log();

  // Set the oracle price to 1 WBTC = $12.5k.
  console.log("Setting the WBTC price ...");
  await wbtcPriceFeed.setPrice(p12dot5k);
  console.log("✨ Just set the oracle price to 1 WBTC = $12.5k");
  console.log();
}

main()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error(error);
    process.exit(1);
  });
