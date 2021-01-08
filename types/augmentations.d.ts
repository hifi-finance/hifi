import { Accounts, Contracts, Signers } from "./";
declare module "mocha" {
  export interface Context {
    accounts: Accounts;
    contracts: Contracts;
    signers: Signers;
  }
}
