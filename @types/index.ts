import { BigNumber } from "@ethersproject/bignumber";
import { BuidlerConfig, Networks, NetworkConfig } from "@nomiclabs/buidler/types";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";

import { BalanceSheet } from "../typechain/BalanceSheet";
import { Dai } from "./contracts/Dai";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { FyToken } from "../typechain/FyToken";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeFyToken } from "../typechain/GodModeFyToken";
import { RedemptionPool } from "../typechain/RedemptionPool";
import { TestOraclePriceUtils as OraclePriceUtils } from "../typechain/TestOraclePriceUtils";
import { SimpleUniswapAnchoredView } from "../typechain/SimpleUniswapAnchoredView";
import { UniswapAnchoredViewInterface } from "../typechain/UniswapAnchoredViewInterface";
import { Weth9 } from "./contracts/Weth9";

/* Fingers-crossed that ethers.js or waffle will provide an easier way to cache the address */
export interface Accounts {
  admin: string;
  borrower: string;
  lender: string;
  liquidator: string;
  maker: string;
  raider: string;
}

/* The first type is for BuidlerEVM, the second for Ethereum Mainnet. */
/* TODO: refactor this so that contract types differ for each test suite type. */
export interface Contracts {
  balanceSheet: GodModeBalanceSheet | BalanceSheet;
  collateral: Erc20Mintable | Weth9;
  fintroller: Fintroller;
  fyToken: GodModeFyToken | FyToken;
  oracle: SimpleUniswapAnchoredView | UniswapAnchoredViewInterface;
  oraclePriceUtils: OraclePriceUtils;
  redemptionPool: GodModeRedemptionPool | RedemptionPool;
  underlying: Erc20Mintable | Dai;
}

/* The @nomiclabs/buidler-ganache is missing type extensions. */
export type ExtendedNetworkConfig = NetworkConfig & {
  _chainId?: number;
  default_balance_ether?: number;
  fork?: string;
  fork_block_number?: number;
  gasLimit?: number;
  mnemonic?: string;
  network_id?: number;
  url?: string;
};

export interface ExtendedNetworks extends Networks {
  [networkName: string]: ExtendedNetworkConfig;
}

export interface ExtendedBuidlerConfig extends BuidlerConfig {
  networks?: ExtendedNetworks;
}

export interface Signers {
  admin: Signer;
  borrower: Signer;
  lender: Signer;
  liquidator: Signer;
  maker: Signer;
  raider: Signer;
}

export interface Stubs {
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  fyToken: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
}

export interface Vault {
  0: BigNumber /* debt */;
  1: BigNumber /* freeCollateral */;
  2: BigNumber /* lockedCollateral */;
  3: boolean /* isOpen */;
}
