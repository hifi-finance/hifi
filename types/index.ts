import { BalanceSheet } from "hifi-protocol/typechain/BalanceSheet";
import { ChainlinkOperator } from "hifi-protocol/typechain/ChainlinkOperator";
import { Fintroller } from "hifi-protocol/typechain/Fintroller";
import { FyToken } from "hifi-protocol/typechain/FyToken";
import { RedemptionPool } from "hifi-protocol/typechain/RedemptionPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { GodModeErc20 } from "../typechain/GodModeErc20";
import { HifiFlashSwap } from "../typechain/HifiFlashSwap";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { UniswapV2Pair } from "./contracts/UniswapV2Pair";

export interface Contracts {
  balanceSheet: BalanceSheet;
  fintroller: Fintroller;
  fyToken: FyToken;
  hifiFlashSwap: HifiFlashSwap;
  oracle: ChainlinkOperator;
  redemptionPool: RedemptionPool;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  raider: SignerWithAddress;
}
