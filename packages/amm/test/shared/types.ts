import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { Fixture } from "ethereum-waffle";
import { MockContract } from "ethereum-waffle";

import { GodModeHifiPoolRegistry } from "../../typechain";
import { GodModeErc20 } from "../../typechain/GodModeErc20";
import { GodModeHifiPool } from "../../typechain/GodModeHifiPool";
import { GodModeHToken } from "../../typechain/GodModeHToken";
import { YieldSpaceMock } from "../../typechain/YieldSpaceMock";

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
  hifiPoolRegistry: GodModeHifiPoolRegistry;
  hToken: GodModeHToken;
  underlying: GodModeErc20;
  yieldSpace: YieldSpaceMock;
}

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
  bob: SignerWithAddress;
  raider: SignerWithAddress;
}

export interface Mocks {
  hifiPool: MockContract;
  hToken: MockContract;
  underlying: MockContract;
}
