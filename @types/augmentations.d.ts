/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fixture } from "ethereum-waffle";

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
  interface Context {
    accounts: Accounts;
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    stubs: Stubs;
  }
}
