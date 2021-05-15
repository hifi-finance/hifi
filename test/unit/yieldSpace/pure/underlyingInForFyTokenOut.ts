import { BigNumber } from "@ethersproject/bignumber";
import { BigNumber as MathjsBigNumber, pow } from "mathjs";
import { expect } from "chai";
import forEach from "mocha-each";

import { EPSILON, K, G1, MAX_UD60x18, SCALE } from "../../../../helpers/constants";
import { bn, fp, mbn } from "../../../../helpers/numbers";
import { secondsInDays, secondsInYears } from "../../../../helpers/time";

export default function shouldBehaveLikeUnderlyingInForFyTokenOut(): void {
  context("when too much fyToken out", function () {
    const testSets = [
      [bn("0"), bn("0"), fp("1"), bn("0")],
      [fp("120"), fp("100"), fp("120.000000000000000001"), bn(secondsInYears(1))],
    ];

    forEach(testSets).it(
      "takes (%e, %e, %e, %e) and reverts",
      async function (
        fyTokenReserves: BigNumber,
        normalizedUnderlyingReserves: BigNumber,
        fyTokenOut: BigNumber,
        timeToMaturity: BigNumber,
      ) {
        await expect(
          this.contracts.yieldSpace.doUnderlyingInForFyTokenOut(
            fyTokenReserves,
            normalizedUnderlyingReserves,
            fyTokenOut,
            timeToMaturity,
          ),
        ).to.be.revertedWith("YieldSpace: too much fyToken out");
      },
    );
  });

  context("when not too much fyToken out", function () {
    context("when the call to fromUint reverts", function () {
      const testSets = [
        [bn(MAX_UD60x18), fp("100"), fp("10"), secondsInYears(1)],
        [bn(MAX_UD60x18).div(SCALE), fp("100"), fp("10"), secondsInYears(1)],
        [fp("120"), bn(MAX_UD60x18), fp("10"), secondsInYears(1)],
        [fp("120"), bn(MAX_UD60x18).div(SCALE), fp("10"), secondsInYears(1)],
      ];

      forEach(testSets).it(
        "takes (%e, %e, %e, %e) and reverts",
        async function (
          fyTokenReserves: BigNumber,
          normalizedUnderlyingReserves: BigNumber,
          fyTokenOut: BigNumber,
          timeToMaturity: BigNumber,
        ) {
          await expect(
            this.contracts.yieldSpace.doUnderlyingInForFyTokenOut(
              fyTokenReserves,
              normalizedUnderlyingReserves,
              fyTokenOut,
              timeToMaturity,
            ),
          ).to.be.revertedWith("Transaction reverted without a reason");
        },
      );
    });

    context("when the call to fromUint does not revert", function () {
      context("when the call to pow reverts", function () {
        const testSets = [
          // The first number is ~2^128.000000963977683559, whose binary logarithm multiplied by the largest exponent
          // possible, which is ~0.999999992468924404, yields a little bit over 128e18 in Solidity. This is the first
          // value which causes the internal call to the "exp2" function to revert.
          [bn("340282594290346490168884578954373811637"), fp("100"), fp("10"), bn("1")],
          [bn(MAX_UD60x18).div(SCALE).sub(1), fp("100"), fp("10"), bn("1")],
        ];

        forEach(testSets).it(
          "takes (%e, %e, %e, %e) and reverts",
          async function (
            fyTokenReserves: BigNumber,
            normalizedUnderlyingReserves: BigNumber,
            fyTokenOut: BigNumber,
            timeToMaturity: BigNumber,
          ) {
            await expect(
              this.contracts.yieldSpace.doUnderlyingInForFyTokenOut(
                fyTokenReserves,
                normalizedUnderlyingReserves,
                fyTokenOut,
                timeToMaturity,
              ),
            ).to.be.revertedWith("Transaction reverted without a reason");
          },
        );
      });

      context("when the call to pow does not revert", function () {
        context("when there is lossy precision underflow", function () {
          const testSets = [
            [fp("6955.267964483355760445"), fp("797.603011106034333609"), fp("4e-17"), bn("23668200")],
            [fp("10721.945986215692199666"), fp("9295.050963679385441209"), fp("1e-14"), bn("39971379")],
          ];

          forEach(testSets).it(
            "takes (%e, %e, %e, %e) and reverts",
            async function (
              fyTokenReserves: BigNumber,
              normalizedUnderlyingReserves: BigNumber,
              fyTokenOut: BigNumber,
              timeToMaturity: BigNumber,
            ) {
              await expect(
                this.contracts.yieldSpace.doUnderlyingInForFyTokenOut(
                  fyTokenReserves,
                  normalizedUnderlyingReserves,
                  fyTokenOut,
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
              fyTokenReserves: string,
              normalizedUnderlyingReserves: string,
              fyTokenOut: string,
              timeToMaturity: string,
            ) {
              const result: BigNumber = await this.contracts.yieldSpace.doUnderlyingInForFyTokenOut(
                fp(fyTokenReserves),
                fp(normalizedUnderlyingReserves),
                fp(fyTokenOut),
                bn(timeToMaturity),
              );

              const exponent: MathjsBigNumber = mbn("1").sub(mbn(K).mul(mbn(timeToMaturity)).mul(mbn(G1)));
              const xs1gt = <MathjsBigNumber>pow(mbn(fyTokenReserves), exponent);
              const ys1gt = <MathjsBigNumber>pow(mbn(normalizedUnderlyingReserves), exponent);
              const x: MathjsBigNumber = mbn(fyTokenReserves).sub(mbn(fyTokenOut));
              const x1gt = <MathjsBigNumber>pow(x, exponent);
              const y = <MathjsBigNumber>pow(xs1gt.add(ys1gt).sub(x1gt), mbn("1").div(exponent));
              const expected = fp(y.sub(normalizedUnderlyingReserves));

              const delta: BigNumber = expected.sub(result).abs();
              expect(delta).to.be.lte(EPSILON);
            },
          );
        });
      });
    });
  });
}
