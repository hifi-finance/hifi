import { BigNumber } from "@ethersproject/bignumber";
import { EPSILON, G2, MAX_UD60x18, SCALE } from "@hifi/constants";
import { bn, getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { PRBMathUD60x18Errors, YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent, outForIn } from "../../../shared/mirrors";

export default function shouldBehaveLikeUnderlyingOutForHTokenIn(): void {
  context("when too many hTokens in", function () {
    const testSets = [
      [hUSDC(MAX_UD60x18), fp("100"), hUSDC("1e-18"), bn(getYearsInSeconds(1))],
      [hUSDC(MAX_UD60x18).div(2), fp("100"), hUSDC(MAX_UD60x18).div(2).add(2), bn(getYearsInSeconds(1))],
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
        ).to.be.revertedWith(YieldSpaceErrors.HTokenReservesOverflow);
      },
    );
  });

  context("when not too many hTokens in", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [hUSDC(MAX_UD60x18).sub(fp("10")), hUSDC("120"), fp("10"), bn(getYearsInSeconds(1))],
        [hUSDC("100"), fp(MAX_UD60x18), hUSDC("10"), bn(getYearsInSeconds(1))],
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
          ).to.be.revertedWith(PRBMathUD60x18Errors.FromUintOverflow);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[hUSDC(MAX_UD60x18).div(fp(SCALE)), fp("110"), hUSDC("10"), bn("1")]];

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
            ).to.be.revertedWith(PRBMathUD60x18Errors.Exp2InputTooBig);
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there are insufficient hToken reserves", function () {
          const testSets = [
            [hUSDC("120"), fp("100"), hUSDC("220.000000000000000001"), bn(getDaysInSeconds(30))],
            [hUSDC("2607"), fp("3799"), hUSDC("6407"), bn(getDaysInSeconds(30))],
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
              ).to.be.revertedWith(YieldSpaceErrors.UnderlyingOutForHTokenInReservesFactorsUnderflow);
            },
          );
        });

        context("when there are sufficient hToken reserves", function () {
          const testSets = [
            ["0", "0", "0", "0"],
            ["1", "1", "1", "1"],
            ["1", "1", "1", getYearsInSeconds(1)],
            ["5.04", "3.14", "0.54", getYearsInSeconds(3)],
            ["120", "100", "10", getDaysInSeconds(30)],
            ["120", "100", "10", getYearsInSeconds(1)],
            ["5528.584115752365727396", "4077.248409399657329853", "307.1381232", getDaysInSeconds(270)],
            ["9248335", "995660.5689", "255866.119", getDaysInSeconds(855)],
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
                hUSDC(hTokenReserves),
                fp(normalizedUnderlyingReserves),
                hUSDC(hTokenIn),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G2);
              const expected: BigNumber = fp(
                outForIn(hTokenReserves, normalizedUnderlyingReserves, hTokenIn, exponent),
              );

              const delta: BigNumber = expected.sub(result).abs();
              expect(delta).to.be.lte(fp(EPSILON));
            },
          );
        });
      });
    });
  });
}
