import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { HToken } from "@hifi/protocol/typechain/HToken";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { GodModeErc20 } from "../typechain/GodModeErc20";
import { HifiFlashUniswapV2 } from "../typechain/HifiFlashUniswapV2";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { UniswapV2Pair } from "./contracts/UniswapV2Pair";

export interface Contracts {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hToken: HToken;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  oracle: ChainlinkOperator;
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
