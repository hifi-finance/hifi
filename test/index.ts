import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { ethers, waffle } from "@nomiclabs/buidler";

import { Accounts, Contracts, Signers, Stubs } from "../@types/index";

import { integrationTestFyToken } from "./integration/fyToken/FyToken";
import { integrationTestRedemptionPool } from "./integration/redemptionPool/RedemptionPool";

import { unitTestBalanceSheet } from "./units/balanceSheet/BalanceSheet";
import { unitTestFintroller } from "./units/fintroller/Fintroller";
import { unitTestFyToken } from "./units/fyToken/FyToken";
import { unitTestOraclePriceUtils } from "./units/oraclePriceUtils/OraclePriceUtils";
import { unitTestRedemptionPool } from "./units/redemptionPool/RedemptionPool";

const { createFixtureLoader } = waffle;

describe("Tests", function () {
  before(async function () {
    this.accounts = {} as Accounts;
    this.contracts = {} as Contracts;
    this.signers = {} as Signers;
    this.stubs = {} as Stubs;

    const signers: Signer[] = await ethers.getSigners();
    this.signers.admin = signers[0];
    this.signers.borrower = signers[1];
    this.signers.lender = signers[2];
    this.signers.liquidator = signers[3];
    this.signers.maker = signers[4];
    this.signers.raider = signers[5];

    this.accounts.admin = await signers[0].getAddress();
    this.accounts.borrower = await signers[1].getAddress();
    this.accounts.lender = await signers[2].getAddress();
    this.accounts.liquidator = await signers[3].getAddress();
    this.accounts.maker = await signers[4].getAddress();
    this.accounts.raider = await signers[5].getAddress();

    /* Get rid of this when https://github.com/nomiclabs/buidler/issues/849 gets fixed. */
    this.loadFixture = createFixtureLoader(signers as Wallet[]);
  });

  describe("Unit Tests", function () {
    unitTestBalanceSheet();
    unitTestFintroller();
    unitTestFyToken();
    unitTestOraclePriceUtils();
    unitTestRedemptionPool();
  });

  describe("Integration Tests", function () {
    integrationTestFyToken();
    integrationTestRedemptionPool();
  });
});
