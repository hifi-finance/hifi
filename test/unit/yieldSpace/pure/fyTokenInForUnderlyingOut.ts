import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { CUTOFF_TTM, MAX_UD60x18, SCALE, ZERO } from "../../../../helpers/constants";
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
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [MAX_UD60x18, fp("120"), fp("10"), secondsInYears(1)],
        [MAX_UD60x18.div(SCALE), fp("120"), fp("10"), secondsInYears(1)],
        [fp("100"), MAX_UD60x18, fp("10"), secondsInYears(1)],
        [fp("100"), MAX_UD60x18.div(SCALE), fp("10"), secondsInYears(1)],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          normalizedUnderlyingReserves: BigNumber,
          fyTokenReserves: BigNumber,
          normalizedUnderlyingOut: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
              normalizedUnderlyingReserves,
              fyTokenReserves,
              normalizedUnderlyingOut,
              timeToMaturity,
            ),
          ).to.be.reverted;
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [
          // The first number is ~2^128.000001068119317841, which when multiplied by the largest exponent possible,
          // which is ~0.999999991655317899, yields a little bit over 128e18. This causes the internal call to
          // the "exp2" function to revert.
          [bn("340282618853809846161851223089384341454"), fp("120"), fp("10"), bn("1")],
          [MAX_UD60x18.div(SCALE).sub(1), fp("120"), fp("10"), bn("1")],
        ];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            normalizedUnderlyingReserves: BigNumber,
            fyTokenReserves: BigNumber,
            normalizedUnderlyingOut: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
                normalizedUnderlyingReserves,
                fyTokenReserves,
                normalizedUnderlyingOut,
                timeToMaturity,
              ),
            ).to.be.reverted;
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [fp("797.603011106034333609"), fp("6955.267964483355760445"), sfp("4e-17"), bn("23668200")],
            [fp("9295.050963679385441209"), fp("10721.945986215692199666"), sfp("1e-14"), bn("39971379")],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              normalizedUnderlyingReserves: BigNumber,
              fyTokenReserves: BigNumber,
              normalizedUnderlyingOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
                  normalizedUnderlyingReserves,
                  fyTokenReserves,
                  normalizedUnderlyingOut,
                  timeToMaturity,
                ),
              ).to.be.revertedWith("YieldSpace: lossy precision underflow");
            },
          );
        });

        context("when there is no lossy precision underflow", function () {
          const testSets = [
            [ZERO, ZERO, ZERO, ZERO, ZERO],
            [fp("1"), fp("1"), fp("1"), bn("1"), fp("1.000000011568185778")],
            [fp("1"), fp("1"), fp("1"), secondsInYears(1), fp("1.561773379534934633")],
            [fp("3.14"), fp("5.04"), fp("0.54"), secondsInYears(3), fp("0.901675576966934915")],
            [fp("100"), fp("120"), fp("10"), secondsInDays(30), fp("10.059630229028745486")],
            [fp("100"), fp("120"), fp("10"), secondsInYears(1), fp("10.758042609858826623")],
            [
              fp("4077.248409399657329853"),
              fp("5528.584115752365727396"),
              fp("307.1381232"),
              secondsInDays(270),
              fp("330.234836640542669566"),
            ],
            [
              fp("995660.5689"),
              fp("9248335"),
              fp("255866.119"),
              secondsInYears(2).add(secondsInDays(125)),
              fp("1145339.583376550805405438"),
            ],
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
  });
}
