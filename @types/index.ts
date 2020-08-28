import { BigNumber } from "@ethersproject/bignumber";
import { MockContract } from "ethereum-waffle";
import { Signer } from "@ethersproject/abstract-signer";

import { DumbOracle } from "../typechain/DumbOracle";
import { Fintroller } from "../typechain/Fintroller";
import { GuarantorPool } from "../typechain/GuarantorPool";
import { YToken } from "../typechain/YToken";

/* Fingers-crossed that ethers.js or waffle will provide an easier way to cache the address */
export interface Accounts {
  admin: string;
  brad: string;
  eve: string;
  grace: string;
  lucy: string;
}

export interface Contracts {
  fintroller: Fintroller;
  guarantorPool: GuarantorPool;
  oracle: DumbOracle;
  yToken: YToken;
}

export interface Signers {
  admin: Signer;
  brad: Signer;
  eve: Signer;
  grace: Signer;
  lucy: Signer;
}

export interface Stubs {
  collateral: MockContract;
  fintroller: MockContract;
  guarantorPool: MockContract;
  oracle: MockContract;
  underlying: MockContract;
  yToken: MockContract;
}
