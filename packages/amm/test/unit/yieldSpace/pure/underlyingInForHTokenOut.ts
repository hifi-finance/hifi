import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { YieldSpaceErrors } from "@hifi/errors";
import { getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";
import { MAX_UD60x18, PRBMathUD60x18Errors, SCALE } from "@prb/math";

import { EPSILON, G1 } from "../../../shared/constants";
import { getYieldExponent, inForOut } from "../../../shared/mirrors";

export function shouldBehaveLikeUnderlyingInForHTokenOut(): void {
  context("when too many hTokens out", function () {
    const testSets = [
      [Zero, Zero, hUSDC("1"), Zero],
      [hUSDC("120"), toBn("100"), hUSDC("120.000000000000000001"), getYearsInSeconds(1)],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        hTokenReserves: BigNumber,
        normalizedUnderlyingReserves: BigNumber,
        hTokenOut: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
            hTokenReserves,
            normalizedUnderlyingReserves,
            hTokenOut,
            timeToMaturity,
          ),
        ).to.be.revertedWith(YieldSpaceErrors.H_TOKEN_RESERVES_UNDERFLOW);
      },
    );
  });

  context("when not too many hTokens out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [MAX_UD60x18, toBn("100"), hUSDC("10"), getYearsInSeconds(1)],
        [hUSDC("120"), MAX_UD60x18, hUSDC("10"), getYearsInSeconds(1)],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          hTokenReserves: BigNumber,
          normalizedUnderlyingReserves: BigNumber,
          hTokenOut: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
              hTokenReserves,
              normalizedUnderlyingReserves,
              hTokenOut,
              timeToMaturity,
            ),
          ).to.be.revertedWith(PRBMathUD60x18Errors.FROM_UINT_OVERFLOW);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[MAX_UD60x18.div(SCALE), toBn("100"), hUSDC("10"), One]];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            hTokenReserves: BigNumber,
            normalizedUnderlyingReserves: BigNumber,
            hTokenOut: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
                hTokenReserves,
                normalizedUnderlyingReserves,
                hTokenOut,
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
              hUSDC("6955.267964483355760445"),
              toBn("797.603011106034333609"),
              hUSDC("4e-17"),
              BigNumber.from(23_668_200),
            ],
            [
              hUSDC("10721.945986215692199666"),
              toBn("9295.050963679385441209"),
              hUSDC("1e-14"),
              BigNumber.from(39_971_379),
            ],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              hTokenReserves: BigNumber,
              normalizedUnderlyingReserves: BigNumber,
              hTokenOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
                  hTokenReserves,
                  normalizedUnderlyingReserves,
                  hTokenOut,
                  timeToMaturity,
                ),
              ).to.be.revertedWith(YieldSpaceErrors.LOSSY_PRECISION_UNDERFLOW);
            },
          );
        });

        context("when there is no lossy precision underflow", function () {
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
              hTokenOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
                hTokenReserves,
                normalizedUnderlyingReserves,
                hTokenOut,
                timeToMaturity,
              );

              const exponent: BigNumber = getYieldExponent(timeToMaturity.mul(SCALE), G1);
              const expected: BigNumber = inForOut(hTokenReserves, normalizedUnderlyingReserves, hTokenOut, exponent);
              const delta: BigNumber = expected.sub(result).abs();
              expect(delta).to.be.lte(EPSILON);
            },
          );
        });
      });
    });
  });
}
