import { Signer } from "@ethersproject/abstract-signer";
import { ethers } from "@nomiclabs/buidler";

import { Accounts, Contracts, Signers, Stubs } from "../@types/index";
import { testBalanceSheet } from "./units/balanceSheet/BalanceSheet";
import { testFintroller } from "./units/fintroller/Fintroller";
import { testGuarantorPool } from "./units/guarantorPool/GuarantorPool";
import { testRedemptionPool } from "./units/redemptionPool/RedemptionPool";
import { testYToken } from "./units/yToken/YToken";

describe("Unit Tests", function () {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let snapshot: any;

  before(async function () {
    this.accounts = {} as Accounts;
    this.contracts = {} as Contracts;
    this.signers = {} as Signers;
    this.stubs = {} as Stubs;

    const signers: Signer[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.brad = signers[1];
    this.signers.eve = signers[2];
    this.signers.grace = signers[3];
    this.signers.lucy = signers[4];
    this.signers.mark = signers[5];

    this.accounts.admin = await signers[0].getAddress();
    this.accounts.brad = await signers[1].getAddress();
    this.accounts.eve = await signers[2].getAddress();
    this.accounts.grace = await signers[3].getAddress();
    this.accounts.lucy = await signers[4].getAddress();
    this.accounts.mark = await signers[5].getAddress();
  });

  // testBalanceSheet();
  // testFintroller();
  testGuarantorPool();
  // testRedemptionPool();
  // testYToken();
});
