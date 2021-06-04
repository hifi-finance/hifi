import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { MockContract } from "ethereum-waffle";

import { GodModeHifiPool } from "../typechain/GodModeHifiPool";
import { YieldSpaceMock } from "../typechain/YieldSpaceMock";

export interface Contracts {
  hifiPool: GodModeHifiPool;
  yieldSpace: YieldSpaceMock;
}

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
}

export interface Mocks {
  fyToken: MockContract;
  underlying: MockContract;
}
