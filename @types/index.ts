import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";

import { GodModeBalanceSheet as BalanceSheet } from "../typechain/GodModeBalanceSheet";
import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { GodModeRedemptionPool as RedemptionPool } from "../typechain/GodModeRedemptionPool";
import { GodModeYToken as YToken } from "../typechain/GodModeYToken";
import { TestOraclePriceScalar as OraclePriceScalar } from "../typechain/TestOraclePriceScalar";
import { SimpleUniswapAnchoredView } from "../typechain/SimpleUniswapAnchoredView";

/* Fingers-crossed that ethers.js or waffle will provide an easier way to cache the address */
export interface Accounts {
  admin: string;
  borrower: string;
  lender: string;
  liquidator: string;
  maker: string;
  raider: string;
}

export interface Contracts {
  balanceSheet: BalanceSheet;
  collateral: Erc20Mintable;
  fintroller: Fintroller;
  oracle: SimpleUniswapAnchoredView;
  oraclePriceScalar: OraclePriceScalar;
  redemptionPool: RedemptionPool;
  underlying: Erc20Mintable;
  yToken: YToken;
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
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  yToken: MockContract;
}

export interface Vault {
  0: BigNumber /* debt */;
  1: BigNumber /* freeCollateral */;
  2: BigNumber /* lockedCollateral */;
  3: boolean /* isOpen */;
}
