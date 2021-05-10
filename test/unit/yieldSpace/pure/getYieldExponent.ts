import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { CUTOFF_TTM, G1, G2, SCALE, SECONDS_YEAR, ZERO } from "../../../../helpers/constants";
import { fp, sfp } from "../../../../helpers/numbers";
import { secondsInDays, secondsInHours } from "../../../../helpers/time";

export default function shouldBehaveLikeGetYieldExponent(): void {
  context("when too far from maturity", function () {
    const g1TestSets = [
      [CUTOFF_TTM.add(1), G1],
      [CUTOFF_TTM.mul(2), G1],
    ];
    const g2TestSets = [
      [CUTOFF_TTM.add(1), G2],
      [CUTOFF_TTM.mul(2), G2],
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
      [ZERO, G1, fp("1")],
      [sfp("1e-18"), G1, fp("1")],
      [secondsInHours(1).mul(SCALE), G1, fp("0.999972888127853680")],
      [secondsInDays(1).mul(SCALE), G1, fp("0.99934931506848832")],
      [SECONDS_YEAR, G1, fp("0.7624999999982368")],
      [CUTOFF_TTM, G1, fp("0.097500007524375436")],
    ];
    const g2TestSets = [
      [ZERO, G2, fp("1")],
      [sfp("1e-18"), G2, fp("1")],
      [secondsInHours(1).mul(SCALE), G2, fp("0.999969959144436211")],
      [secondsInDays(1).mul(SCALE), G2, fp("0.999279019466469053")],
      [SECONDS_YEAR, G2, fp("0.736842105261204211")],
      [CUTOFF_TTM, G2, sfp("8.337258101e-9")],
    ];
    const testSets = g1TestSets.concat(g2TestSets);

    forEach(testSets).it(
      "takes %e and %e and returns %e",
      async function (timeToMaturity: BigNumber, g: BigNumber, expected: BigNumber) {
        const result: BigNumber = await this.contracts.yieldSpace.doGetYieldExponent(timeToMaturity, g);
        expect(expected).to.equal(result);
      },
    );
  });
}
