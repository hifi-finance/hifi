/* eslint-disable @typescript-eslint/no-explicit-any */
import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import { ethers, waffle } from "hardhat";

import { Contracts, Signers, Stubs } from "../types/index";

const { createFixtureLoader } = waffle;

/**
 * This is run at the beginning of each suite of tests: 2e2, integration and unit.
 */
export function baseContext(description: string, hooks: () => void): void {
  describe(description, function () {
    before(async function () {
      this.contracts = {} as Contracts;
      this.signers = {} as Signers;
      this.stubs = {} as Stubs;

      const signers: SignerWithAddress[] = await ethers.getSigners();
      this.signers.admin = signers[0];
      this.signers.borrower = signers[1];
      this.signers.lender = signers[2];
      this.signers.liquidator = signers[3];
      this.signers.maker = signers[4];
      this.signers.raider = signers[5];

      /* Get rid of this when https://github.com/nomiclabs/hardhat/issues/849 gets fixed. */
      this.loadFixture = createFixtureLoader((signers as Signer[]) as Wallet[]);
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
