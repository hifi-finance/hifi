import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { EPSILON, G1, MAX_UD60x18, SCALE } from "../../../../helpers/constants";
import { bn, hUSDC } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";
import { getYieldExponent, inForOut } from "../../../shared/mirrors";

export default function shouldBehaveLikeUnderlyingInForHTokenOut(): void {
  context("when too much hToken out", function () {
    const testSets = [
      [hUSDC("0"), fp("0"), hUSDC("1"), bn("0")],
      [hUSDC("120"), fp("100"), hUSDC("120.000000000000000001"), bn(secondsInYears(1))],
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
        ).to.be.revertedWith("YieldSpace: too much hToken out");
      },
    );
  });

  context("when not too much hToken out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [hUSDC(MAX_UD60x18), fp("100"), hUSDC("10"), secondsInYears(1)],
        [hUSDC("120"), fp(MAX_UD60x18), hUSDC("10"), secondsInYears(1)],
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
          ).to.be.revertedWith("Transaction reverted without a reason");
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [[hUSDC(MAX_UD60x18).div(fp(SCALE)), fp("100"), hUSDC("10"), bn("1")]];

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
            ).to.be.revertedWith("Transaction reverted without a reason");
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [hUSDC("6955.267964483355760445"), fp("797.603011106034333609"), hUSDC("4e-17"), bn("23668200")],
            [hUSDC("10721.945986215692199666"), fp("9295.050963679385441209"), hUSDC("1e-14"), bn("39971379")],
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
              ).to.be.revertedWith("YieldSpace: lossy precision underflow");
            },
          );
        });

        context("when there is no lossy precision underflow", function () {
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
              hTokenOut: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doUnderlyingInForHTokenOut(
                hUSDC(hTokenReserves),
                fp(normalizedUnderlyingReserves),
                hUSDC(hTokenOut),
                bn(timeToMaturity),
              );

              const exponent: string = getYieldExponent(timeToMaturity, G1);
              const expected: BigNumber = fp(
                inForOut(hTokenReserves, normalizedUnderlyingReserves, hTokenOut, exponent),
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
