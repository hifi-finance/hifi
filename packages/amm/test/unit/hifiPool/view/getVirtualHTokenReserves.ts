import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { HifiPoolErrors } from "@hifi/errors";
import { hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";
import { MAX_UD60x18 } from "@prb/math";

export function shouldBehaveLikeGetVirtualHTokenReserves(): void {
  context("when there is no hToken in the pool", function () {
    beforeEach(async function () {
      await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
    });

    const testSets = [One, toBn("100"), toBn("1729"), MAX_UD60x18];

    forEach(testSets).it("returns the total supply", async function (totalSupply: BigNumber) {
      await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
      const result: BigNumber = await this.contracts.hifiPool.getVirtualHTokenReserves();
      expect(totalSupply).to.equal(result);
    });
  });

  context("when there is hToken in the pool", function () {
    context("when the addition overflows", function () {
      const testSets = [
        [hUSDC("1e-18"), MAX_UD60x18],
        [MAX_UD60x18.div(2).add(2), MAX_UD60x18.div(2)],
        [MAX_UD60x18, hUSDC("1e-18")],
        [MAX_UD60x18.div(2), MAX_UD60x18.div(2).add(2)],
      ];

      forEach(testSets).it(
        "takes %e and %e and reverts",
        async function (hTokenBalance: BigNumber, totalSupply: BigNumber) {
          await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(hTokenBalance);
          await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
          await expect(this.contracts.hifiPool.getVirtualHTokenReserves()).to.be.revertedWith(
            HifiPoolErrors.VIRTUAL_H_TOKEN_RESERVES_OVERFLOW,
          );
        },
      );
    });

    context("when the addition does not overflow", function () {
      const testSets = [
        [hUSDC("100"), hUSDC("1000")],
        [hUSDC("5606"), hUSDC("46304.19")],
        [hUSDC("28094.892"), hUSDC("89904.556")],
        [hUSDC("549846.799912"), hUSDC("5159245.001")],
        [hUSDC("12e6"), hUSDC("189e8")],
        [hUSDC("3.1415e15"), hUSDC("27.18e18")],
        [MAX_UD60x18.sub(1), hUSDC("1e-18")],
      ];

      forEach(testSets).it(
        "takes %e and %e returns the correct virtual hToken reserves",
        async function (hTokenBalance: BigNumber, totalSupply: BigNumber) {
          await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(hTokenBalance);
          await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
          const result: BigNumber = await this.contracts.hifiPool.getVirtualHTokenReserves();
          const expected = hTokenBalance.add(totalSupply);
          expect(expected).to.equal(result);
        },
      );
    });
  });
}
