import { ethers } from "@nomiclabs/buidler";

/**
 * An utility function that takes a snapshot of the EVM and reverts to it after the
 * provided mocha hooks are executed.
 *
 * WARNING: an excessive use of this function will slow down testing.
 */
export function contextForTimeDependentTests(description: string, hooks: () => void): void {
  describe(description, function () {
    let snapshot: any;

    beforeEach(async function () {
      snapshot = await ethers.provider.send("evm_snapshot", []);
    });

    hooks();

    afterEach(async function () {
      await ethers.provider.send("evm_revert", [snapshot]);
    });
  });
}
