import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";

import { BalanceSheet } from "../typechain/BalanceSheet";
import { ChainlinkOperator } from "../typechain/ChainlinkOperator";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { FyToken } from "../typechain/FyToken";
import { GodModeBalanceSheet } from "../typechain/GodModeBalanceSheet";
import { GodModeRedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeFyToken } from "../typechain/GodModeFyToken";
import { RedemptionPool } from "../typechain/RedemptionPool";
import { SimplePriceFeed } from "../typechain/SimplePriceFeed";

/* Fingers-crossed that ethers.js or waffle will provide an easier way to cache the address */
export interface Accounts {
  admin: string;
  borrower: string;
  lender: string;
  liquidator: string;
  maker: string;
  raider: string;
}

/* The first type is for Hardhat Network tests, the second for Ethereum Mainnet. */
/* TODO: refactor this so that contract types differ for each test suite type. */
export interface Contracts {
  balanceSheet: GodModeBalanceSheet | BalanceSheet;
  collateral: Erc20Mintable;
  collateralPriceFeed: SimplePriceFeed;
  fintroller: Fintroller;
  fyToken: GodModeFyToken | FyToken;
  oracle: ChainlinkOperator;
  redemptionPool: GodModeRedemptionPool | RedemptionPool;
  underlying: Erc20Mintable;
  underlyingPriceFeed: SimplePriceFeed;
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
  collateralPriceFeed: MockContract;
  fintroller: MockContract;
  fyToken: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  underlyingPriceFeed: MockContract;
}

export interface Vault {
  0: BigNumber /* debt */;
  1: BigNumber /* freeCollateral */;
  2: BigNumber /* lockedCollateral */;
  3: boolean /* isOpen */;
}
