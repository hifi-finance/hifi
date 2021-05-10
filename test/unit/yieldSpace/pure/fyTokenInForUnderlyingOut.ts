import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { ZERO } from "../../../../helpers/constants";
import { fp } from "../../../../helpers/numbers";
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
    const testSets = [[ZERO, ZERO, ZERO, ZERO, ZERO]];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and returns %e",
      async function (
        underlyingReserves: BigNumber,
        fyTokenReserves: BigNumber,
        underlyingAmount: BigNumber,
        timeToMaturity: BigNumber,
        expected: BigNumber,
      ) {
        const result: BigNumber = await this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
          underlyingReserves,
          fyTokenReserves,
          underlyingAmount,
          timeToMaturity,
        );
        expect(expected).to.equal(result);
      },
    );
  });
}
