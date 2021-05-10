import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { ZERO } from "../../../../helpers/constants";
import { bn, fp, sfp } from "../../../../helpers/numbers";
import { secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeFyTokenInForUnderlyingOut(): void {
  context("when too much underlying out", function () {
    const testSets = [
      [ZERO, ZERO, fp("1"), ZERO],
      [fp("100"), fp("110"), fp("100.000000000000000001"), secondsInYears(1)],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        underlyingReserves: BigNumber,
        fyTokenReserves: BigNumber,
        underlyingAmount: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
            underlyingReserves,
            fyTokenReserves,
            underlyingAmount,
            timeToMaturity,
          ),
        ).to.be.revertedWith("YieldSpace: too much underlying out");
      },
    );
  });

  context("when not too much underlying out", function () {
    const testSets = [
      [ZERO, ZERO, ZERO, ZERO, ZERO],
      [
        fp("18.364758544493064720"),
        fp("1.311768467463790320"),
        sfp("2.0015998343868e-5"),
        bn("1"),
        sfp("2.0015997903004e-5"),
      ],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and returns %e",
      async function (
        underlyingReserves: BigNumber,
        fyTokenReserves: BigNumber,
        underlyingAmount: BigNumber,
        timeToMaturity: BigNumber,
        expected: BigNumber,
      ) {
        const fyTokenAmount: BigNumber = await this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
          underlyingReserves,
          fyTokenReserves,
          underlyingAmount,
          timeToMaturity,
        );
        expect(expected).to.equal(fyTokenAmount);
      },
    );
  });
}
