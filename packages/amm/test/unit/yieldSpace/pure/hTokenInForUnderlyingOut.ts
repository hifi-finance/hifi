import { BigNumber } from "@ethersproject/bignumber";
import { EPSILON, G2, MAX_UD60x18, SCALE } from "@hifi/constants";
import { bn, getDaysInSeconds, getYearsInSeconds, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { PRBMathUD60x18Errors, YieldSpaceErrors } from "../../../shared/errors";
import { getYieldExponent, inForOut } from "../../../shared/mirrors";

export default function shouldBehaveLikeHTokenInForUnderlyingOut(): void {
  context("when too much underlying out", function () {
    const testSets = [
      [fp("0"), hUSDC("0"), fp("1"), bn("0")],
      [fp("100"), hUSDC("120"), fp("100.000000000000000001"), bn(getYearsInSeconds(1))],
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
        ).to.be.revertedWith(YieldSpaceErrors.UnderlyingReservesUnderflow);
      },
    );
  });

  context("when not too much underlying out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [fp(MAX_UD60x18), hUSDC("120"), fp("10"), bn(getYearsInSeconds(1))],
        [fp("100"), hUSDC(MAX_UD60x18), fp("10"), bn(getYearsInSeconds(1))],
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
          ).to.be.revertedWith(PRBMathUD60x18Errors.FromUintOverflow);
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[fp(MAX_UD60x18).div(fp(SCALE)), hUSDC("110"), fp("10"), bn("1")]];

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
            ).to.be.revertedWith(PRBMathUD60x18Errors.Exp2InputTooBig);
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [fp("797.603011106034333609"), hUSDC("6955.267964483355760445"), fp("4e-17"), bn("23668200")],
            [fp("9295.050963679385441209"), hUSDC("10721.945986215692199666"), fp("1e-14"), bn("39971379")],
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
              ).to.be.revertedWith(YieldSpaceErrors.LossyPrecisionUnderflow);
            },
          );
        });

        context("when there is no lossy precision underflow", function () {
          const testSets = [
            ["0", "0", "0", "0"],
            ["1", "1", "1", "1"],
            ["1", "1", "1", getYearsInSeconds(1)],
            ["3.14", "5.04", "0.54", getYearsInSeconds(3)],
            ["100", "120", "10", getDaysInSeconds(30)],
            ["100", "120", "10", getYearsInSeconds(1)],
            ["4077.248409399657329853", "5528.584115752365727396", "307.1381232", getDaysInSeconds(270)],
            ["995660.5689", "9248335", "255866.119", getDaysInSeconds(855)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and returns the correct value",
            async function (
              normalizedUnderlyingReserves: string,
              hTokenReserves: string,
              normalizedUnderlyingOut: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doHTokenInForUnderlyingOut(
                fp(normalizedUnderlyingReserves),
                hUSDC(hTokenReserves),
                fp(normalizedUnderlyingOut),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G2);
              const expected: BigNumber = hUSDC(
                inForOut(normalizedUnderlyingReserves, hTokenReserves, normalizedUnderlyingOut, exponent),
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
