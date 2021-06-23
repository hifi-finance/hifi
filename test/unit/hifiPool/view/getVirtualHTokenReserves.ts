import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { MAX_UD60x18 } from "../../../../helpers/constants";
import { bn, hUSDC } from "../../../../helpers/numbers";
import Errors from "../../../shared/errors";

export default function shouldBehaveLikeGetVirtualHTokenReserves(): void {
  context("when there is no hToken in the pool", function () {
    beforeEach(async function () {
      await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
    });

    const testSets = [[bn("1"), fp("100"), fp("1729"), [fp(MAX_UD60x18)]]];

    forEach(testSets).it("returns the total supply", async function (totalSupply: BigNumber) {
      await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
      const result: BigNumber = await this.contracts.hifiPool.getVirtualHTokenReserves();
      expect(totalSupply).to.equal(result);
    });
  });

  context("when there is hToken in the pool", function () {
    context("when the addition overflows", function () {
      const testSets = [
        [hUSDC("1e-18"), hUSDC(MAX_UD60x18)],
        [hUSDC(MAX_UD60x18).div(2).add(2), hUSDC(MAX_UD60x18).div(2)],
        [hUSDC(MAX_UD60x18), hUSDC("1e-18")],
        [hUSDC(MAX_UD60x18).div(2), hUSDC(MAX_UD60x18).div(2).add(2)],
      ];

      forEach(testSets).it(
        "takes %e and %e and reverts",
        async function (hTokenBalance: BigNumber, totalSupply: BigNumber) {
          await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(hTokenBalance);
          await this.contracts.hifiPool.__godMode_setTotalSupply(totalSupply);
          await expect(this.contracts.hifiPool.getVirtualHTokenReserves()).to.be.revertedWith(
            Errors.VirtualHTokenReservesOverflow,
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
        [hUSDC(MAX_UD60x18).sub(1), hUSDC("1e-18")],
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
