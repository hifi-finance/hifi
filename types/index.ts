import { Signer } from "@ethersproject/abstract-signer";

import { FiatTokenV2 as USDC } from "./contracts/FiatTokenV2";
import { HifiFlashSwap } from "../typechain/HifiFlashSwap";
import { UniswapV2Pair } from "./contracts/UniswapV2Pair";
import { WBTC } from "./contracts/WBTC";

export interface Contracts {
  collateral: WBTC;
  hifiFlashSwap: HifiFlashSwap;
  underlying: USDC;
  uniswapV2Pair: UniswapV2Pair;
}

export interface Signers {
  admin: Signer;
  borrower: Signer;
  liquidator: Signer;
  raider: Signer;
}
