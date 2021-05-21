import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { MAX_UD60x18 } from "../../../../helpers/constants";
import { bn } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetVirtualFyTokenReserves(): void {
  context("when there is no fyToken in the pool", function () {
    beforeEach(async function () {
      await this.stubs.fyToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
    });

    const testSets = [[bn("1"), fp("100"), fp("1729"), [fp(MAX_UD60x18)]]];

    forEach(testSets).it("returns the total supply", async function (totalSupply: BigNumber) {
      await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
      const result: BigNumber = await this.contracts.hifiPool.getVirtualFyTokenReserves();
      expect(totalSupply).to.equal(result);
    });
  });

  context("when there is fyToken in the pool", function () {
    context("when the addition overflows", function () {
      const testSets = [
        [bn("1"), fp(MAX_UD60x18)],
        [fp(MAX_UD60x18).div(2).add(2), fp(MAX_UD60x18).div(2)],
        [fp(MAX_UD60x18), bn("1")],
        [fp(MAX_UD60x18).div(2), fp(MAX_UD60x18).div(2).add(2)],
      ];

      forEach(testSets).it(
        "takes %e and %e and reverts",
        async function (fyTokenBalance: BigNumber, totalSupply: BigNumber) {
          await this.stubs.fyToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(fyTokenBalance);
          await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
          await expect(this.contracts.hifiPool.getVirtualFyTokenReserves()).to.be.revertedWith(
            "HifiPool: virtual fyToken reserves overflow",
          );
        },
      );
    });

    context("when the addition does not overflow", function () {
      const testSets = [
        [fp("100"), fp("1000")],
        [fp("5606"), fp("46304.19")],
        [fp("28094.892"), fp("89904.556")],
        [fp("549846.799912"), fp("5159245.001")],
        [fp("12e6"), fp("189e8")],
        [fp("3.14e15"), fp("27.18e18")],
        [fp(MAX_UD60x18).sub(1), bn("1")],
      ];

      forEach(testSets).it(
        "takes %e and %e returns the correct virtual fyToken reserves",
        async function (fyTokenBalance: BigNumber, totalSupply: BigNumber) {
          await this.stubs.fyToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(fyTokenBalance);
          await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
          const result: BigNumber = await this.contracts.hifiPool.getVirtualFyTokenReserves();
          const expected = fyTokenBalance.add(totalSupply);
          expect(expected).to.equal(result);
        },
      );
    });
  });
}
