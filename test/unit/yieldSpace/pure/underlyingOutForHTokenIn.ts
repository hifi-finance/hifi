import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { EPSILON, G2, MAX_UD60x18, SCALE } from "../../../../helpers/constants";
import { getYieldExponent, outForIn } from "../../../../helpers/math";
import { bn } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeUnderlyingOutForHTokenIn(): void {
  context("when too much hToken in", function () {
    const testSets = [
      [fp(MAX_UD60x18), fp("100"), fp("1e-18"), bn(secondsInYears(1))],
      [fp(MAX_UD60x18).div(2), fp("100"), fp(MAX_UD60x18).div(2).add(2), bn(secondsInYears(1))],
    ];

    forEach(testSets).it(
      "takes %e and reverts",
      async function (
        hTokenReserves: BigNumber,
        normalizedUnderlyingReserves: BigNumber,
        hTokenIn: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
            hTokenReserves,
            normalizedUnderlyingReserves,
            hTokenIn,
            timeToMaturity,
          ),
        ).to.be.revertedWith("YieldSpace: too much hToken in");
      },
    );
  });

  context("when not too much hToken in", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [fp(MAX_UD60x18).sub(fp("10")), fp("120"), fp("10"), bn(secondsInYears(1))],
        [fp("100"), fp(MAX_UD60x18), fp("10"), bn(secondsInYears(1))],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          hTokenReserves: BigNumber,
          normalizedUnderlyingReserves: BigNumber,
          hTokenIn: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
              hTokenReserves,
              normalizedUnderlyingReserves,
              hTokenIn,
              timeToMaturity,
            ),
          ).to.be.revertedWith("Transaction reverted without a reason");
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [
          // The first number is ~2^128.000001068119317841, whose binary logarithm multiplied by the largest exponent
          // possible, which is ~0.999999991655317899, yields a little bit over 128e18 in Solidity.  This is the first
          // value which causes the internal call to the "exp2" function to revert.
          [bn("340282618853809846161851223089384341454"), fp("110"), fp("10"), bn("1")],
          [fp(MAX_UD60x18).div(fp(SCALE)).sub(1), fp("110"), fp("10"), bn("1")],
        ];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            hTokenReserves: BigNumber,
            normalizedUnderlyingReserves: BigNumber,
            hTokenIn: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
                hTokenReserves,
                normalizedUnderlyingReserves,
                hTokenIn,
                timeToMaturity,
              ),
            ).to.be.revertedWith("Transaction reverted without a reason");
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there are insufficient hToken reserves", function () {
          const testSets = [
            [fp("120"), fp("100"), fp("220.000000000000000001"), bn(secondsInDays(30))],
            [fp("2607"), fp("3799"), fp("6407"), bn(secondsInDays(30))],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              hTokenReserves: BigNumber,
              normalizedUnderlyingReserves: BigNumber,
              hTokenIn: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
                  hTokenReserves,
                  normalizedUnderlyingReserves,
                  hTokenIn,
                  timeToMaturity,
                ),
              ).to.be.revertedWith("YieldSpace: insufficient hToken reserves");
            },
          );
        });

        context("when there are sufficient hToken reserves", function () {
          const testSets = [
            ["0", "0", "0", "0"],
            ["1", "1", "1", "1"],
            ["1", "1", "1", secondsInYears(1)],
            ["5.04", "3.14", "0.54", secondsInYears(3)],
            ["120", "100", "10", secondsInDays(30)],
            ["120", "100", "10", secondsInYears(1)],
            ["5528.584115752365727396", "4077.248409399657329853", "307.1381232", secondsInDays(270)],
            ["9248335", "995660.5689", "255866.119", secondsInDays(855)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and returns the correct value",
            async function (
              hTokenReserves: string,
              normalizedUnderlyingReserves: string,
              hTokenIn: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
                fp(hTokenReserves),
                fp(normalizedUnderlyingReserves),
                fp(hTokenIn),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G2);
              const expected: BigNumber = fp(
                outForIn(hTokenReserves, normalizedUnderlyingReserves, hTokenIn, exponent),
              );

              const delta: BigNumber = expected.sub(result).abs();
              expect(delta).to.be.lte(EPSILON);
            },
          );
        });
      });
    });
  });
}
