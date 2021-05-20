import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { EPSILON, G2, MAX_UD60x18, SCALE } from "../../../../helpers/constants";
import { getYieldExponent, inForOut } from "../../../../helpers/math";
import { bn } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeFyTokenInForUnderlyingOut(): void {
  context("when too much underlying out", function () {
    const testSets = [
      [bn("0"), bn("0"), fp("1"), bn("0")],
      [fp("100"), fp("120"), fp("100.000000000000000001"), bn(secondsInYears(1))],
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
        ).to.be.revertedWith("YieldSpace: too much underlying out");
      },
    );
  });

  context("when not too much underlying out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [fp(MAX_UD60x18), fp("120"), fp("10"), bn(secondsInYears(1))],
        [fp(MAX_UD60x18).div(fp(SCALE)), fp("120"), fp("10"), bn(secondsInYears(1))],
        [fp("100"), fp(MAX_UD60x18), fp("10"), bn(secondsInYears(1))],
        [fp("100"), fp(MAX_UD60x18).div(fp(SCALE)), fp("10"), bn(secondsInYears(1))],
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
            ).to.be.revertedWith("Transaction reverted without a reason");
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [fp("797.603011106034333609"), fp("6955.267964483355760445"), fp("4e-17"), bn("23668200")],
            [fp("9295.050963679385441209"), fp("10721.945986215692199666"), fp("1e-14"), bn("39971379")],
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
              fyTokenReserves: string,
              normalizedUnderlyingOut: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doFyTokenInForUnderlyingOut(
                fp(normalizedUnderlyingReserves),
                fp(fyTokenReserves),
                fp(normalizedUnderlyingOut),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G2);
              const expected: BigNumber = fp(
                inForOut(normalizedUnderlyingReserves, fyTokenReserves, normalizedUnderlyingOut, exponent),
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
