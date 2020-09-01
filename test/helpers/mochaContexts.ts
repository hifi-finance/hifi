import { waffle } from "@nomiclabs/buidler";

import { FintrollerConstants, TenTokens } from "./constants";

/**
 * @dev This functions assumes that the user's vault is open.
 */
export function contextForBradDepositingTenTokensAsCollateral(description: string, hooks: () => void): void {
  describe(description, function () {
    beforeEach(async function () {
      /* Mock the necessary functions on the Fintroller and the Erc20 contracts. */
      await this.stubs.fintroller.mock.getBond
        .withArgs(this.contracts.yToken.address)
        .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
      await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.contracts.yToken.address).returns(true);
      await this.stubs.collateral.mock.transferFrom
        .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
        .returns(true);

      /* Deposit the WETH collateral. */
      await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
    });

    hooks();
  });
}

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
      snapshot = await waffle.provider.send("evm_snapshot", []);
    });

    hooks();

    afterEach(async function () {
      await waffle.provider.send("evm_revert", [snapshot]);
    });
  });
}
