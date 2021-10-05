import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";
import { MAX_UD60x18, PRBMathUD60x18Errors, SCALE } from "prb-math.js";

import { EPSILON, G2 } from "../../../shared/constants";
import { YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent, outForIn } from "../../../shared/mirrors";

export function shouldBehaveLikeUnderlyingOutForHTokenIn(): void {
  context("when too many hTokens in", function () {
    const testSets = [
      [MAX_UD60x18, toBn("100"), hUSDC("1e-18"), getYearsInSeconds(1)],
      [MAX_UD60x18.div(2), toBn("100"), MAX_UD60x18.div(2).add(2), getYearsInSeconds(1)],
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
        ).to.be.revertedWith(YieldSpaceErrors.H_TOKEN_RESERVES_OVERFLOW);
      },
    );
  });

  context("when not too many hTokens in", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [MAX_UD60x18.sub(toBn("10")), hUSDC("120"), toBn("10"), getYearsInSeconds(1)],
        [hUSDC("100"), MAX_UD60x18, hUSDC("10"), getYearsInSeconds(1)],
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
          ).to.be.revertedWith(PRBMathUD60x18Errors.FROM_UINT_OVERFLOW);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[MAX_UD60x18.div(SCALE), toBn("110"), hUSDC("10"), One]];

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
            ).to.be.revertedWith(PRBMathUD60x18Errors.EXP2_INPUT_TOO_BIG);
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there are insufficient hToken reserves", function () {
          const testSets = [
            [hUSDC("120"), toBn("100"), hUSDC("220.000000000000000001"), getDaysInSeconds(30)],
            [hUSDC("2607"), toBn("3799"), hUSDC("6407"), getDaysInSeconds(30)],
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
              ).to.be.revertedWith(YieldSpaceErrors.UNDERLYING_OUT_FOR_H_TOKEN_IN_RESERVES_FACTORS_UNDERFLOW);
            },
          );
        });

        context("when there are sufficient hToken reserves", function () {
          const testSets = [
            [Zero, Zero, Zero, Zero],
            [hUSDC("1"), toBn("1"), hUSDC("1"), One],
            [hUSDC("1"), toBn("1"), hUSDC("1"), getYearsInSeconds(1)],
            [hUSDC("5.04"), toBn("3.14"), hUSDC("0.54"), getYearsInSeconds(3)],
            [hUSDC("120"), toBn("100"), hUSDC("10"), getDaysInSeconds(30)],
            [hUSDC("120"), toBn("100"), hUSDC("10"), getYearsInSeconds(1)],
            [
              hUSDC("5528.584115752365727396"),
              toBn("4077.248409399657329853"),
              hUSDC("307.1381232"),
              getDaysInSeconds(270),
            ],
            [hUSDC("9248335"), toBn("995660.5689"), hUSDC("255866.119"), getDaysInSeconds(855)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and returns the correct value",
            async function (
              hTokenReserves: BigNumber,
              normalizedUnderlyingReserves: BigNumber,
              hTokenIn: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doUnderlyingOutForHTokenIn(
                hTokenReserves,
                normalizedUnderlyingReserves,
                hTokenIn,
                timeToMaturity,
              );

              const exponent: BigNumber = getYieldExponent(timeToMaturity.mul(SCALE), G2);
              const expected: BigNumber = outForIn(hTokenReserves, normalizedUnderlyingReserves, hTokenIn, exponent);
              const delta: BigNumber = expected.sub(result).abs();
              expect(delta).to.be.lte(EPSILON);
            },
          );
        });
      });
    });
  });
}
