import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";

import { GodModeBalanceSheet as BalanceSheet } from "../typechain/GodModeBalanceSheet";
import { Fintroller } from "../typechain/Fintroller";
import { GuarantorPool } from "../typechain/GuarantorPool";
import { GodModeRedemptionPool as RedemptionPool } from "../typechain/GodModeRedemptionPool";
import { SimpleUniswapAnchoredView } from "../typechain/SimpleUniswapAnchoredView";
import { YToken } from "../typechain/YToken";

/* Fingers-crossed that ethers.js or waffle will provide an easier way to cache the address */
export interface Accounts {
  admin: string;
  brad: string;
  eve: string;
  grace: string;
  lucy: string;
  mark: string;
}

export interface Contracts {
  balanceSheet: BalanceSheet;
  fintroller: Fintroller;
  guarantorPool: GuarantorPool;
  oracle: SimpleUniswapAnchoredView;
  redemptionPool: RedemptionPool;
  yToken: YToken;
}

export interface Signers {
  admin: Signer;
  brad: Signer;
  eve: Signer;
  grace: Signer;
  lucy: Signer;
  mark: Signer;
}

export interface Stubs {
  asset: MockContract;
  balanceSheet: MockContract;
  collateral: MockContract;
  fintroller: MockContract;
  guarantorPool: MockContract;
  oracle: MockContract;
  redemptionPool: MockContract;
  underlying: MockContract;
  yToken: MockContract;
}

export interface Vault {
  debt: BigNumber;
  freeCollateral: BigNumber;
  lockedCollateral: BigNumber;
  isOpen: boolean;
}
