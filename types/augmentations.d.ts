import { Contracts, Signers } from "./";
declare module "mocha" {
  export interface Context {
    contracts: Contracts;
    signers: Signers;
  }
}
