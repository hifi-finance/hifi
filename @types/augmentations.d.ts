/* eslint-disable @typescript-eslint/no-explicit-any */
// import { Contract } from "@ethersproject/contracts";
import { Fixture } from "ethereum-waffle";
// import { Signer } from "@ethersproject/abstract-signer";
// import { TransactionRequest } from "@ethersproject/providers";

import { Accounts, Contracts, Signers, Stubs } from "./";

export interface TypeChainConfig {
  outDir?: string;
  target?: "ethers-v4" | "ethers-v5" | "truffle-v4" | "truffle-v5" | "web3-v1";
}

declare module "@nomiclabs/buidler/types" {
  interface BuidlerConfig {
    typechain?: TypeChainConfig;
  }

  interface ProjectPaths {
    coverage: string;
    coverageJson: string;
    cryticExport: string;
    typechain: string;
  }
}
declare module "mocha" {
  export interface Context {
    accounts: Accounts;
    contracts: Contracts;
    // deployContract: (
    //   signer: Signer,
    //   contractJSON: any,
    //   args: any[],
    //   overrideOptions?: TransactionRequest,
    // ) => Promise<Contract>;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    stubs: Stubs;
  }
}
