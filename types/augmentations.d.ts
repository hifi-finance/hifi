/* eslint-disable @typescript-eslint/no-explicit-any */
import { Fixture } from "ethereum-waffle";

import { Accounts, Contracts, Signers, Stubs } from "./";

declare module "mocha" {
  interface Context {
    accounts: Accounts;
    contracts: Contracts;
    loadFixture: <T>(fixture: Fixture<T>) => Promise<T>;
    signers: Signers;
    stubs: Stubs;
  }
}
