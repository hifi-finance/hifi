import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { GodModeErc20 } from "../typechain/GodModeErc20";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { HifiFlashUniswapV2 } from "../typechain/HifiFlashUniswapV2";
import { MaliciousPair } from "../typechain/MaliciousPair";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";
import { UniswapV2Pair } from "../typechain/UniswapV2Pair";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    signers: Signers;
  }
}

export interface Contracts {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  hToken: GodModeHToken;
  hifiFlashUniswapV2: HifiFlashUniswapV2;
  maliciousPair: MaliciousPair;
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
