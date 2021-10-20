import { BalanceSheetV1 } from "@hifi/protocol/typechain/BalanceSheetV1";
import { ChainlinkOperator } from "@hifi/protocol/typechain/ChainlinkOperator";
import { FintrollerV1 } from "@hifi/protocol/typechain/FintrollerV1";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeUniswapV2Pair } from "../../src/types/GodModeUniswapV2Pair";
import type { HifiFlashUniswapV2 } from "../../src/types/HifiFlashUniswapV2";
import type { MaliciousPair } from "../../src/types/MaliciousPair";
import type { SimplePriceFeed } from "../../src/types/SimplePriceFeed";

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
  uniswapV2Pair: GodModeUniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  raider: SignerWithAddress;
}
