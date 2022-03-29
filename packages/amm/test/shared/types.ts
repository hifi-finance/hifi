import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import type { Fixture } from "ethereum-waffle";
import type { MockContract } from "ethereum-waffle";

import type { GodModeErc20 } from "../../src/types/contracts/test/GodModeErc20";
import type { GodModeHToken } from "../../src/types/contracts/test/GodModeHToken";
import type { GodModeHifiPool } from "../../src/types/contracts/test/GodModeHifiPool";
import type { GodModeHifiPoolRegistry } from "../../src/types/contracts/test/GodModeHifiPoolRegistry";
import type { YieldSpaceMock } from "../../src/types/contracts/test/YieldSpaceMock";

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
