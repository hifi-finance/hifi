import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "hardhat";

import UniswapV2PairAbi from "./abis/UniswapV2Pair.json";
import USDCAbi from "./abis/FiatTokenV2.json";
import WBTCAbi from "./abis/WBTC.json";

import { FiatTokenV2 as USDC } from "../../types/contracts/FiatTokenV2";
// import { HifiFlashSwap } from "../../typechain/HifiFlashSwap";
import { UniswapV2Pair } from "../../types/contracts/UniswapV2Pair";
import { WBTC } from "../../types/contracts/WBTC";
// import { deployHifiFlashSwap } from "../deployers";
import { mainnetAddresses } from "../../helpers/constants";

// Ensure that we have all requisite environment variables. The Fintroller and the BalanceSheet
// are meant to be deployed before running the tests.
// let fintrollerAddress: string;
// if (!process.env.FINTROLLER_ADDRESS) {
//   throw new Error("Please set your FINTROLLER_ADDRESS in a .env file");
// } else {
//   fintrollerAddress = process.env.FINTROLLER_ADDRESS;
// }

// let balanceSheetAddress: string;
// if (!process.env.BALANCE_SHEET_ADDRESS) {
//   throw new Error("Please set your BALANCE_SHEET_ADDRESS in a .env file");
// } else {
//   balanceSheetAddress = process.env.BALANCE_SHEET_ADDRESS;
// }

type HifiFlashSwapE2eFixtureReturnType = {
  collateral: WBTC;
  underlying: USDC;
  uniswapV2Pair: UniswapV2Pair;
};

export async function hifiFlashSwapE2eFixture(_signers: Signer[]): Promise<HifiFlashSwapE2eFixtureReturnType> {
  // const deployer: Signer = signers[0];

  // Load the external contracts from mainnet.
  const collateral: WBTC = new ethers.Contract(mainnetAddresses.WBTC, WBTCAbi, ethers.provider) as WBTC;
  const underlying: USDC = new ethers.Contract(mainnetAddresses.USDC, USDCAbi, ethers.provider) as USDC;
  const uniswapV2Pair: UniswapV2Pair = new ethers.Contract(
    mainnetAddresses["UNI-V2-WBTC-USDC"],
    UniswapV2PairAbi,
    ethers.provider,
  ) as UniswapV2Pair;

  const myBalance = await underlying.balanceOf("0xc3c51E27C228deBC182E8C802DCB4cA919acbC77");
  console.log({ myBalance: myBalance.toString() });

  // Deploy the HifiFlashSwap contract.
  // const hifiFlashSwap: HifiFlashSwap = await deployHifiFlashSwap(deployer, "", "", "");

  return {
    collateral,
    underlying,
    uniswapV2Pair,
  };
}
