import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockContract } from "ethereum-waffle";
import { Fixture } from "ethereum-waffle";

import { GodModeErc20 } from "../typechain/GodModeErc20";
import { GodModeHifiPool } from "../typechain/GodModeHifiPool";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { YieldSpaceMock } from "../typechain/YieldSpaceMock";

declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    mocks: Mocks;
    signers: Signers;
  }
}

export interface Contracts {
  hifiPool: GodModeHifiPool;
  hToken: GodModeHToken;
  underlying: GodModeErc20;
  yieldSpace: YieldSpaceMock;
}

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
}

export interface Mocks {
  hToken: MockContract;
  underlying: MockContract;
}
