import type { BalanceSheetV1 } from "@hifi/protocol/dist/types/BalanceSheetV1";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/ChainlinkOperator";
import type { FintrollerV1 } from "@hifi/protocol/dist/types/FintrollerV1";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeUniswapV2Pair } from "../../src/types/GodModeUniswapV2Pair";
import type { HifiFlashUniswapV2 } from "../../src/types/HifiFlashUniswapV2";
import type { HifiFlashUniswapV2Underlying } from "../../src/types/HifiFlashUniswapV2Underlying";
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
  hifiFlashUniswapV2Underlying: HifiFlashUniswapV2Underlying;
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
  bot: SignerWithAddress;
}
