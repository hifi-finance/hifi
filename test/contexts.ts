/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { ethers, waffle } from "hardhat";

import { Accounts, Contracts, Signers, Stubs } from "../types/index";

const { createFixtureLoader } = waffle;

/**
 * This is run at the beginning of each suite of tests: 2e2, integration and unit.
 */
export function baseContext(description: string, hooks: () => void): void {
  describe(description, function () {
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

      /* Get rid of this when https://github.com/nomiclabs/hardhat/issues/849 gets fixed. */
      this.loadFixture = createFixtureLoader(signers as Wallet[]);
    });

    hooks();
  });
}

/**
 * Takes a snapshot of the EVM and reverts to it after the provided mocha
 * hooks are executed.
 *
 * WARNING: an excessive use of this function will slow down testing.
 * WARNING2: this is a child snapshot within a parent snapshot run by the Waffle fixture.
 */
export function contextForTimeDependentTests(description: string, hooks: () => void): void {
  describe(description, function () {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let snapshot: any;

    beforeEach(async function () {
      snapshot = await waffle.provider.send("evm_snapshot", []);
    });

    hooks();

    afterEach(async function () {
      await waffle.provider.send("evm_revert", [snapshot]);
    });
  });
}
