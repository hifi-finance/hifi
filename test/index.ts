import { Signer } from "@ethersproject/abstract-signer";
import { ethers, waffle } from "@nomiclabs/buidler";

import { Accounts, Contracts, Signers, Stubs } from "../@types/index";
import { testBalanceSheet } from "./units/balanceSheet/BalanceSheet";
import { testFintroller } from "./units/fintroller/Fintroller";
import { testRedemptionPool } from "./units/redemptionPool/RedemptionPool";
import { testYToken } from "./units/yToken/YToken";

describe("Unit Tests", function () {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  let snapshot: any;

  before(async function () {
    snapshot = await waffle.provider.send("evm_snapshot", []);
  });

  before(async function () {
    this.accounts = {} as Accounts;
    this.contracts = {} as Contracts;
    this.signers = {} as Signers;
    this.stubs = {} as Stubs;

    const signers: Signer[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.brad = signers[1];
    this.signers.grace = signers[2];
    this.signers.lucy = signers[3];
    this.signers.eve = signers[4];

    this.accounts.admin = await signers[0].getAddress();
    this.accounts.brad = await signers[1].getAddress();
    this.accounts.grace = await signers[2].getAddress();
    this.accounts.lucy = await signers[3].getAddress();
    this.accounts.eve = await signers[4].getAddress();
  });

  testBalanceSheet();
  testFintroller();
  testRedemptionPool();
  testYToken();

  after(async function () {
    await waffle.provider.send("evm_revert", [snapshot]);
  });
});
