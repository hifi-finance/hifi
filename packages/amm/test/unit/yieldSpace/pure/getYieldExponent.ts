import { BigNumber } from "@ethersproject/bignumber";
import { CUTOFF_TTM, EPSILON, G1, G2, SCALE } from "@hifi/constants";
import { bn, getDaysInSeconds, getHoursInSeconds, getYearsInSeconds } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetYieldExponent(): void {
  context("when too far from maturity", function () {
    const g1TestSets = [
      [bn(CUTOFF_TTM).mul(fp(SCALE)).add(1), fp(G1)],
      [bn(CUTOFF_TTM).mul(fp(SCALE)).mul(2), fp(G1)],
    ];
    const g2TestSets = [
      [bn(CUTOFF_TTM).mul(fp(SCALE)).add(1), fp(G2)],
      [bn(CUTOFF_TTM).mul(fp(SCALE)).mul(2), fp(G2)],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it("takes %e and %e and reverts", async function (timeToMaturity: BigNumber, g: BigNumber) {
      await expect(this.contracts.yieldSpace.doGetYieldExponent(timeToMaturity, g)).to.be.revertedWith(
        YieldSpaceErrors.TooFarFromMaturity,
      );
    });
  });

  context("when not too far from maturity", function () {
    const g1TestSets = [
      ["0", G1],
      ["1", G1],
      [getHoursInSeconds(1), G1],
      [getDaysInSeconds(1), G1],
      [getYearsInSeconds(1), G1],
      [CUTOFF_TTM, G1],
    ];
    const g2TestSets = [
      ["0", G2],
      ["1", G2],
      [getHoursInSeconds(1), G2],
      [getDaysInSeconds(1), G2],
      [getYearsInSeconds(1), G2],
      [CUTOFF_TTM, G2],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it(
      "takes %e and %e and returns the correct value",
      async function (timeToMaturity: string, g: string) {
        const result: BigNumber = await this.contracts.yieldSpace.doGetYieldExponent(fp(timeToMaturity), fp(g));
        const expected: BigNumber = fp(getYieldExponent(timeToMaturity, g));
        const delta: BigNumber = expected.sub(result).abs();
        expect(delta).to.be.lte(fp(EPSILON));
      },
    );
  });
}
