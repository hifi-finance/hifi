import { Fixture } from "ethereum-waffle";
import { GodModeErc20 } from "../typechain/GodModeErc20";
import { GodModeHToken } from "../typechain/GodModeHToken";
import { GodModeHifiPool } from "../typechain/GodModeHifiPool";
import { GodModeHifiPoolRegistry } from "../typechain";
import { MockContract } from "ethereum-waffle";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
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
  hifiPoolRegistry: GodModeHifiPoolRegistry;
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
  hifiPool: MockContract;
  hToken: MockContract;
  underlying: MockContract;
}
