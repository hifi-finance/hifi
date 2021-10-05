import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";
import { MAX_UD60x18, PRBMathUD60x18Errors, SCALE } from "prb-math.js";

import { EPSILON, G2 } from "../../../shared/constants";
import { YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent, inForOut } from "../../../shared/mirrors";

export function shouldBehaveLikeHTokenInForUnderlyingOut(): void {
  context("when too much underlying out", function () {
    const testSets = [
      [Zero, Zero, toBn("1"), Zero],
      [toBn("100"), hUSDC("120"), toBn("100.000000000000000001"), getYearsInSeconds(1)],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        normalizedUnderlyingReserves: BigNumber,
        hTokenReserves: BigNumber,
        normalizedUnderlyingOut: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
            normalizedUnderlyingReserves,
            hTokenReserves,
            normalizedUnderlyingOut,
            timeToMaturity,
          ),
        ).to.be.revertedWith(YieldSpaceErrors.UNDERLYING_RESERVES_UNDERFLOW);
      },
    );
  });

  context("when not too much underlying out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [MAX_UD60x18, hUSDC("120"), toBn("10"), getYearsInSeconds(1)],
        [toBn("100"), MAX_UD60x18, toBn("10"), getYearsInSeconds(1)],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          normalizedUnderlyingReserves: BigNumber,
          hTokenReserves: BigNumber,
          normalizedUnderlyingOut: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
              normalizedUnderlyingReserves,
              hTokenReserves,
              normalizedUnderlyingOut,
              timeToMaturity,
            ),
          ).to.be.revertedWith(PRBMathUD60x18Errors.FROM_UINT_OVERFLOW);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[MAX_UD60x18.div(SCALE), hUSDC("110"), toBn("10"), One]];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            normalizedUnderlyingReserves: BigNumber,
            hTokenReserves: BigNumber,
            normalizedUnderlyingOut: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingOut,
                timeToMaturity,
              ),
            ).to.be.revertedWith(PRBMathUD60x18Errors.EXP2_INPUT_TOO_BIG);
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [
              toBn("797.603011106034333609"),
              hUSDC("6955.267964483355760445"),
              toBn("4e-17"),
              BigNumber.from(23_668_200),
            ],
            [
              toBn("9295.050963679385441209"),
              hUSDC("10721.945986215692199666"),
              toBn("1e-14"),
              BigNumber.from(39_971_379),
            ],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              normalizedUnderlyingReserves: BigNumber,
              hTokenReserves: BigNumber,
              normalizedUnderlyingOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
                  normalizedUnderlyingReserves,
                  hTokenReserves,
                  normalizedUnderlyingOut,
                  timeToMaturity,
                ),
              ).to.be.revertedWith(YieldSpaceErrors.LOSSY_PRECISION_UNDERFLOW);
            },
          );
        });

        context("when there is no lossy precision underflow", function () {
          const testSets = [
            [Zero, Zero, Zero, Zero],
            [toBn("1"), hUSDC("1"), toBn("1"), BigNumber.from(1)],
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
              normalizedUnderlyingOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingOut,
                timeToMaturity,
              );

              const exponent: BigNumber = getYieldExponent(timeToMaturity.mul(SCALE), G2);
              const expected: BigNumber = inForOut(
                normalizedUnderlyingReserves,
                hTokenReserves,
                normalizedUnderlyingOut,
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
