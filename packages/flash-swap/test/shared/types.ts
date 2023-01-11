import type { BalanceSheetV2 } from "@hifi/protocol/dist/types/contracts/core/balance-sheet/BalanceSheetV2";
import type { Fintroller } from "@hifi/protocol/dist/types/contracts/core/fintroller/Fintroller";
import type { ChainlinkOperator } from "@hifi/protocol/dist/types/contracts/oracles/ChainlinkOperator";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { GodModeHToken } from "../../src/types/contracts/test/GodModeHToken";
import type { SimplePriceFeed } from "../../src/types/contracts/test/SimplePriceFeed";
import type { FlashUniswapV2 } from "../../src/types/contracts/uniswap-v2/FlashUniswapV2";
import type { GodModeUniswapV2Pair } from "../../src/types/contracts/uniswap-v2/test/GodModeUniswapV2Pair";
import type { MaliciousPair as MaliciousV2Pair } from "../../src/types/contracts/uniswap-v2/test/MaliciousPair";
import type { FlashUniswapV3 } from "../../src/types/contracts/uniswap-v3/FlashUniswapV3";
import type { GodModeUniswapV3Pool } from "../../src/types/contracts/uniswap-v3/test/GodModeUniswapV3Pool";
import type { MaliciousPool as MaliciousV3Pool } from "../../src/types/contracts/uniswap-v3/test/MaliciousPool";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    signers: Signers;
  }
}

export interface Contracts {
  balanceSheet: BalanceSheetV2;
  fintroller: Fintroller;
  flashUniswapV2: FlashUniswapV2;
  flashUniswapV3: FlashUniswapV3;
  hToken: GodModeHToken;
  maliciousV2Pair: MaliciousV2Pair;
  maliciousV3Pool: MaliciousV3Pool;
  oracle: ChainlinkOperator;
  usdc: GodModeErc20;
  usdcPriceFeed: SimplePriceFeed;
  uniswapV2Pair: GodModeUniswapV2Pair;
  uniswapV3Pool: GodModeUniswapV3Pool;
  wbtc: GodModeErc20;
  wbtcPriceFeed: SimplePriceFeed;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  raider: SignerWithAddress;
}
