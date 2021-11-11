import type { BalanceSheetV1 } from "@hifi/protocol/dist/types/BalanceSheetV1";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/ChainlinkOperator";
import type { FintrollerV1 } from "@hifi/protocol/dist/types/FintrollerV1";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { FlashUniswapV2 } from "../../src/types/FlashUniswapV2";
import type { GodModeErc20 } from "../../src/types/GodModeErc20";
import type { GodModeHToken } from "../../src/types/GodModeHToken";
import type { GodModeUniswapV2Pair } from "../../src/types/GodModeUniswapV2Pair";
import type { MaliciousPair } from "../../src/types/MaliciousPair";
import type { SimplePriceFeed } from "../../src/types/SimplePriceFeed";
import type { UnderlyingFlashUniswapV2 } from "../../src/types/UnderlyingFlashUniswapV2";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    signers: Signers;
  }
}

export interface Contracts {
  balanceSheet: BalanceSheetV1;
  fintroller: FintrollerV1;
  flashUniswapV2: FlashUniswapV2;
  hToken: GodModeHToken;
  maliciousPair: MaliciousPair;
  oracle: ChainlinkOperator;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  underlyingFlashUniswapV2: UnderlyingFlashUniswapV2;
  uniswapV2Pair: GodModeUniswapV2Pair;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  raider: SignerWithAddress;
  subsidizer: SignerWithAddress;
}
