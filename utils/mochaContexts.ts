import { BigNumber } from "@ethersproject/bignumber";
import { waffle } from "@nomiclabs/buidler";

import { DefaultNumberOfDecimals, Ten } from "./constants";

const newDecimals: BigNumber = BigNumber.from(6);
const deltaBetweenDecimals: BigNumber = DefaultNumberOfDecimals.sub(newDecimals);
const newCollateralPrecisionScalar: BigNumber = Ten.pow(deltaBetweenDecimals);

/**
 * Takes a snapshot of the EVM and reverts to it after the provided mocha
 * hooks are executed.
 *
 * WARNING: an excessive use of this function will slow down testing.
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

/**
 * Lowers the stubbed collateral token's decimals from 18 to 6.
 */
export function contextForStubbedCollateralWithSixDecimals(description: string, hooks: () => void): void {
  describe(description, function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(newDecimals);
      await this.stubs.yToken.mock.collateralPrecisionScalar.returns(newCollateralPrecisionScalar);
    });

    hooks();
  });
}

/**
 * Lowers the stubbed underlying token's decimals from 18 to 6.
 */
export function contextForStubbedUnderlyingWithSixDecimals(description: string, hooks: () => void): void {
  describe(description, function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.decimals.returns(newDecimals);
      await this.stubs.yToken.mock.underlyingPrecisionScalar.returns(newCollateralPrecisionScalar);
    });

    hooks();
  });
}
