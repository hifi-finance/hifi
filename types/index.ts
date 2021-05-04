import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

import { HifiPool } from "../typechain";

export interface Contracts {
  hifiPool: HifiPool;
}

export interface Signers {
  admin: SignerWithAddress;
}
