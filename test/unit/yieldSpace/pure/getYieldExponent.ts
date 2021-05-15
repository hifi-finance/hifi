import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { CUTOFF_TTM, EPSILON, G1, G2, K, SCALE } from "../../../../helpers/constants";
import { bn, fp, mbn } from "../../../../helpers/numbers";
import { secondsInDays, secondsInHours, secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeGetYieldExponent(): void {
  context("when too far from maturity", function () {
    const g1TestSets = [
      [bn(CUTOFF_TTM).mul(SCALE).add(1), fp(G1)],
      [bn(CUTOFF_TTM).mul(SCALE).mul(2), fp(G1)],
    ];
    const g2TestSets = [
      [bn(CUTOFF_TTM).mul(SCALE).add(1), fp(G2)],
      [bn(CUTOFF_TTM).mul(SCALE).mul(2), fp(G2)],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it("takes %e and %e and reverts", async function (timeToMaturity: BigNumber, g: BigNumber) {
      await expect(this.contracts.yieldSpace.doGetYieldExponent(timeToMaturity, g)).to.be.revertedWith(
        "YieldSpace: too far from maturity",
      );
    });
  });

  context("when not too far from maturity", function () {
    const g1TestSets = [
      ["0", G1],
      ["1", G1],
      [secondsInHours(1), G1],
      [secondsInDays(1), G1],
      [secondsInYears(1), G1],
      [CUTOFF_TTM, G1],
    ];
    const g2TestSets = [
      ["0", G2],
      ["1", G2],
      [secondsInHours(1), G2],
      [secondsInDays(1), G2],
      [secondsInYears(1), G2],
      [CUTOFF_TTM, G2],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it(
      "takes %e and %e and returns the correct value",
      async function (timeToMaturity: string, g: string) {
        const result: BigNumber = await this.contracts.yieldSpace.doGetYieldExponent(fp(timeToMaturity), fp(g));
        const expected: BigNumber = fp(mbn("1").sub(mbn(K).mul(mbn(timeToMaturity)).mul(mbn(g))));
        const delta: BigNumber = expected.sub(result).abs();
        expect(delta).to.be.lte(EPSILON);
      },
    );
  });
}
