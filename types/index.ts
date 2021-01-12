import { BalanceSheet } from "@hifi/protocol/typechain/BalanceSheet";
import { Fintroller } from "@hifi/protocol/typechain/Fintroller";
import { FyToken } from "@hifi/protocol/typechain/FyToken";
import { RedemptionPool } from "@hifi/protocol/typechain/RedemptionPool";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { HifiFlashSwap } from "../typechain/HifiFlashSwap";
import { SimpleOracle } from "../typechain/SimpleOracle";
import { UniswapV2Pair } from "./contracts/UniswapV2Pair";

export interface Contracts {
  balanceSheet: BalanceSheet;
  fintroller: Fintroller;
  fyToken: FyToken;
  hifiFlashSwap: HifiFlashSwap;
  oracle: SimpleOracle;
  redemptionPool: RedemptionPool;
  usdc: Erc20Mintable;
  uniswapV2Pair: UniswapV2Pair;
  wbtc: Erc20Mintable;
}

export interface Signers {
  admin: SignerWithAddress;
  borrower: SignerWithAddress;
  liquidator: SignerWithAddress;
  raider: SignerWithAddress;
}
