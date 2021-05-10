import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { ZERO } from "../../../../helpers/constants";
import { bn, fp, sfp } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeFyTokenInForUnderlyingOut(): void {
  context("when too much underlying out", function () {
    const testSets = [
      [ZERO, ZERO, fp("1"), ZERO],
      [fp("100"), fp("110"), fp("100.000000000000000001"), secondsInYears(1)],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        normalizedUnderlyingReserves: BigNumber,
        fyTokenReserves: BigNumber,
        normalizedUnderlyingAmount: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
            normalizedUnderlyingReserves,
            fyTokenReserves,
            normalizedUnderlyingAmount,
            timeToMaturity,
          ),
        ).to.be.revertedWith("YieldSpace: too much underlying out");
      },
    );
  });

  context("when not too much underlying out", function () {
    context("when the call to pow reverts", function () {});

    context("when the call to pow does not revert", function () {
      context("when the call to inv reverts", function () {});

      context("when the call to inv does not revert", function () {
        const testSets = [
          [ZERO, ZERO, ZERO, ZERO, ZERO],
          [fp("100"), fp("120"), fp("10"), secondsInDays(30), fp("10.059630229028745816")],
          [fp("100"), fp("120"), fp("10"), secondsInYears(1), fp("10.758042609858827770")],
        ];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and returns %e",
          async function (
            normalizedUnderlyingReserves: BigNumber,
            fyTokenReserves: BigNumber,
            normalizedUnderlyingOut: BigNumber,
            timeToMaturity: BigNumber,
            expected: BigNumber,
          ) {
            const fyTokenIn: BigNumber = await this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
              normalizedUnderlyingReserves,
              fyTokenReserves,
              normalizedUnderlyingOut,
              timeToMaturity,
            );
            expect(expected).to.equal(fyTokenIn);
          },
        );
      });
    });
  });
}
