import { Erc20Mintable } from "../typechain/Erc20Mintable";
import { Fintroller } from "../typechain/Fintroller";
import { GuarantorPool } from "../typechain/GuarantorPool";
import { Scenario } from "./";
import { SuperMinter } from "../typechain/SuperMinter";
import { YToken } from "../typechain/YToken";

export interface TypechainConfig {
  outDir?: string;
  target?: "ethers-v4" | "ethers-v5" | "truffle-v4" | "truffle-v5" | "web3-v1";
}

declare module "@nomiclabs/buidler/types" {
  interface BuidlerConfig {
    typechain?: TypechainConfig;
  }

  interface ProjectPaths {
    coverage: string;
    coverageJson: string;
    typechain: string;
  }
}
declare module "mocha" {
  export interface Context {
    collateral: Erc20Mintable;
    fintroller: Fintroller;
    guarantorPool: GuarantorPool;
    scenario: Scenario;
    superMinter: SuperMinter;
    underlying: Erc20Mintable;
    yToken: YToken;
  }
}
