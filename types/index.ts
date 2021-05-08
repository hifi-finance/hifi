import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { HifiPool, YieldSpaceMock } from "../typechain";

export interface Contracts {
  hifiPool: HifiPool;
  yieldSpace: YieldSpaceMock;
}

export interface Signers {
  admin: SignerWithAddress;
  alice: SignerWithAddress;
}
