import { BigNumber } from "@ethersproject/bignumber";
import { Zero, One } from "@ethersproject/constants";
import { getDaysInSeconds, getHoursInSeconds, getYearsInSeconds } from "@hifi/helpers";
import { expect } from "chai";
import forEach from "mocha-each";
import { SCALE } from "prb-math.js";

import { CUTOFF_TTM, EPSILON, G1, G2 } from "../../../shared/constants";
import { YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetYieldExponent(): void {
  context("when too far from maturity", function () {
    const g1TestSets = [
      [CUTOFF_TTM.mul(SCALE).add(1), G1],
      [CUTOFF_TTM.mul(SCALE).mul(2), G1],
    ];
    const g2TestSets = [
      [CUTOFF_TTM.mul(SCALE).add(1), G2],
      [CUTOFF_TTM.mul(SCALE).mul(2), G2],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it("takes %e and %e and reverts", async function (timeToMaturity: BigNumber, g: BigNumber) {
      await expect(this.contracts.yieldSpace.doGetYieldExponent(timeToMaturity, g)).to.be.revertedWith(
        YieldSpaceErrors.TOO_FAR_FROM_MATURITY,
      );
    });
  });

  context("when not too far from maturity", function () {
    const g1TestSets = [
      [Zero, G1],
      [One, G1],
      [getHoursInSeconds(1), G1],
      [getDaysInSeconds(1), G1],
      [getYearsInSeconds(1), G1],
      [CUTOFF_TTM, G1],
    ];
    const g2TestSets = [
      [Zero, G2],
      [One, G2],
      [getHoursInSeconds(1), G2],
      [getDaysInSeconds(1), G2],
      [getYearsInSeconds(1), G2],
      [CUTOFF_TTM, G2],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it(
      "takes %e and %e and returns the correct value",
      async function (timeToMaturity: BigNumber, g: BigNumber) {
        const normalizedTimeToMaturity: BigNumber = timeToMaturity.mul(SCALE);
        const result: BigNumber = await this.contracts.yieldSpace.doGetYieldExponent(normalizedTimeToMaturity, g);
        const expected: BigNumber = getYieldExponent(normalizedTimeToMaturity, g);
        const delta: BigNumber = expected.sub(result).abs();
        expect(delta).to.be.lte(EPSILON);
      },
    );
  });
}
