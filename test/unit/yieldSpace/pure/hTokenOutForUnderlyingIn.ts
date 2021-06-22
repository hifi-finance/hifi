import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { EPSILON, G1, MAX_UD60x18, SCALE } from "../../../../helpers/constants";
import { bn, hUSDC } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";
import { getYieldExponent, outForIn } from "../../../shared/mirrors";

export default function shouldBehaveLikeHTokenOutForUnderlyingIn(): void {
  context("when too much underlying in", function () {
    const testSets = [
      [fp(MAX_UD60x18), hUSDC("100"), fp("1e-18"), bn(secondsInYears(1))],
      [fp(MAX_UD60x18).div(2), hUSDC("100"), fp(MAX_UD60x18).div(2).add(2), bn(secondsInYears(1))],
    ];

    forEach(testSets).it(
      "takes %e and reverts",
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
        ).to.be.revertedWith("YieldSpace: too much underlying in");
      },
    );
  });

  context("when not too much underlying in", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [fp(MAX_UD60x18).sub(fp("10")), hUSDC("120"), fp("10"), bn(secondsInYears(1))],
        [fp("100"), hUSDC(MAX_UD60x18), fp("10"), bn(secondsInYears(1))],
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
          ).to.be.revertedWith("Transaction reverted without a reason");
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[fp(MAX_UD60x18).div(fp(SCALE)), hUSDC("100"), fp("10"), bn("1")]];

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
            ).to.be.revertedWith("Transaction reverted without a reason");
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there are insufficient underlying reserves", function () {
          const testSets = [
            [fp("100"), hUSDC("120"), fp("220.000000000000000001"), bn(secondsInDays(30))],
            [fp("3799"), hUSDC("2607"), fp("6407"), bn(secondsInDays(30))],
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
              ).to.be.revertedWith("YieldSpace: insufficient underlying reserves");
            },
          );
        });

        context("when there are sufficient underlying reserves", function () {
          const testSets = [
            ["0", "0", "0", "0"],
            ["1", "1", "1", "1"],
            ["1", "1", "1", secondsInYears(1)],
            ["3.14", "5.04", "0.54", secondsInYears(3)],
            ["100", "120", "10", secondsInDays(30)],
            ["100", "120", "10", secondsInYears(1)],
            ["4077.248409399657329853", "5528.584115752365727396", "307.1381232", secondsInDays(270)],
            ["995660.5689", "9248335", "255866.119", secondsInDays(855)],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and returns the correct value",
            async function (
              normalizedUnderlyingReserves: string,
              hTokenReserves: string,
              normalizedUnderlyingIn: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doHTokenOutForUnderlyingIn(
                fp(normalizedUnderlyingReserves),
                hUSDC(hTokenReserves),
                fp(normalizedUnderlyingIn),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G1);
              const expected: BigNumber = fp(
                outForIn(normalizedUnderlyingReserves, hTokenReserves, normalizedUnderlyingIn, exponent),
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
