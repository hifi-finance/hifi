import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { MAX_UD60x18 } from "../../../../helpers/constants";
import { bn, usdc } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetNormalizedUnderlyingReserves(): void {
  context("when there is no underlying in the pool", function () {
    beforeEach(async function () {
      await this.stubs.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
    });

    it("returns 0", async function () {
      const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
      expect(bn("0")).to.equal(result);
    });
  });

  context("when there is underlying in the pool", function () {
    context("when the underlying has 18 decimals", function () {
      beforeEach(async function () {
        await this.contracts.hifiPool.__godMode_setUnderlyingPrecisionScalar(bn("1"));
      });

      const testSets = [[fp("1e-18")], [fp("100")], [fp("1729")], [fp("31415.92")], [fp(MAX_UD60x18)]];

      forEach(testSets).it("takes %e and returns the correct underlying reserves", async function (x: BigNumber) {
        await this.stubs.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(x);
        const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
        expect(x).to.equal(result);
      });
    });

    context("when the underlying has 6 decimals", function () {
      const underlyingPrecisionScalar: BigNumber = bn("1e12");

      beforeEach(async function () {
        await this.contracts.hifiPool.__godMode_setUnderlyingPrecisionScalar(underlyingPrecisionScalar);
      });

      const testSets = [[usdc("1e-6")], [usdc("1e2")], [usdc("1729")], [fp("31415.92")], [usdc(MAX_UD60x18)]];

      forEach(testSets).it("takes %e and returns the correct underlying reserves", async function (x: BigNumber) {
        await this.stubs.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(x);
        const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
        expect(x.mul(underlyingPrecisionScalar)).to.equal(result);
      });
    });
  });
}
