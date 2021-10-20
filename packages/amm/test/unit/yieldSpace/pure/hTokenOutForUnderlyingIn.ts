import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { YieldSpaceErrors } from "@hifi/errors";
import { getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";
import { MAX_UD60x18, PRBMathUD60x18Errors, SCALE } from "prb-math";

import { EPSILON, G1 } from "../../../shared/constants";
import { getYieldExponent, outForIn } from "../../../shared/mirrors";

export function shouldBehaveLikeHTokenOutForUnderlyingIn(): void {
  context("when too much underlying in", function () {
    const testSets = [
      [MAX_UD60x18, hUSDC("100"), toBn("1e-18"), getYearsInSeconds(1)],
      [MAX_UD60x18.div(2), hUSDC("100"), MAX_UD60x18.div(2).add(2), getYearsInSeconds(1)],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        normalizedUnderlyingReserves: BigNumber,
        hTokenReserves: BigNumber,
        normalizedUnderlyingIn: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
            normalizedUnderlyingReserves,
            hTokenReserves,
            normalizedUnderlyingIn,
            timeToMaturity,
          ),
        ).to.be.revertedWith(YieldSpaceErrors.UNDERLYING_RESERVES_OVERFLOW);
      },
    );
  });

  context("when not too much underlying in", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [MAX_UD60x18.sub(toBn("10")), hUSDC("120"), toBn("10"), getYearsInSeconds(1)],
        [toBn("100"), MAX_UD60x18, toBn("10"), getYearsInSeconds(1)],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          normalizedUnderlyingReserves: BigNumber,
          hTokenReserves: BigNumber,
          normalizedUnderlyingIn: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
              normalizedUnderlyingReserves,
              hTokenReserves,
              normalizedUnderlyingIn,
              timeToMaturity,
            ),
          ).to.be.revertedWith(PRBMathUD60x18Errors.FROM_UINT_OVERFLOW);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[MAX_UD60x18.div(SCALE), hUSDC("100"), toBn("10"), One]];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            normalizedUnderlyingReserves: BigNumber,
            hTokenReserves: BigNumber,
            normalizedUnderlyingIn: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingIn,
                timeToMaturity,
              ),
            ).to.be.revertedWith(PRBMathUD60x18Errors.EXP2_INPUT_TOO_BIG);
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there are insufficient underlying reserves", function () {
          const testSets = [
            [toBn("100"), hUSDC("120"), toBn("220.000000000000000001"), getDaysInSeconds(30)],
            [toBn("3799"), hUSDC("2607"), toBn("6407"), getDaysInSeconds(30)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              normalizedUnderlyingReserves: BigNumber,
              hTokenReserves: BigNumber,
              normalizedUnderlyingIn: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
                  normalizedUnderlyingReserves,
                  hTokenReserves,
                  normalizedUnderlyingIn,
                  timeToMaturity,
                ),
              ).to.be.revertedWith(YieldSpaceErrors.H_TOKEN_OUT_FOR_UNDERLYING_IN_RESERVES_FACTORS_UNDERFLOW);
            },
          );
        });

        context("when there are sufficient underlying reserves", function () {
          const testSets = [
            [Zero, Zero, Zero, Zero],
            [toBn("1"), hUSDC("1"), toBn("1"), One],
            [toBn("1"), hUSDC("1"), toBn("1"), getYearsInSeconds(1)],
            [toBn("3.14"), hUSDC("5.04"), toBn("0.54"), getYearsInSeconds(3)],
            [toBn("100"), hUSDC("120"), toBn("10"), getDaysInSeconds(30)],
            [toBn("100"), hUSDC("120"), toBn("10"), getYearsInSeconds(1)],
            [
              toBn("4077.248409399657329853"),
              hUSDC("5528.584115752365727396"),
              toBn("307.1381232"),
              getDaysInSeconds(270),
            ],
            [toBn("995660.5689"), hUSDC("9248335"), toBn("255866.119"), getDaysInSeconds(855)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and returns the correct value",
            async function (
              normalizedUnderlyingReserves: BigNumber,
              hTokenReserves: BigNumber,
              normalizedUnderlyingIn: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingIn,
                timeToMaturity,
              );

              const exponent: BigNumber = getYieldExponent(timeToMaturity.mul(SCALE), G1);
              const expected: BigNumber = outForIn(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingIn,
                exponent,
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
