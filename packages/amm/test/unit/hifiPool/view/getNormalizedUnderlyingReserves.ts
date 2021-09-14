import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { MAX_UD60x18, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { USDC, bn } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

export default function shouldBehaveLikeGetNormalizedUnderlyingReserves(): void {
  context("when there is no underlying in the pool", function () {
    beforeEach(async function () {
      await this.mocks.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
    });

    it("returns 0", async function () {
      const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
      expect(Zero).to.equal(result);
    });
  });

  context("when there is underlying in the pool", function () {
    context("when the underlying has 18 decimals", function () {
      beforeEach(async function () {
        await this.contracts.hifiPool.__godMode_setUnderlyingPrecisionScalar(bn("1"));
      });

      const testSets = [[fp("1e-18")], [fp("100")], [fp("1729")], [fp("31415.92")], [fp(MAX_UD60x18)]];

      forEach(testSets).it(
        "takes %e and returns the correct underlying reserves",
        async function (underlyingBalance: BigNumber) {
          await this.mocks.underlying.mock.balanceOf
            .withArgs(this.contracts.hifiPool.address)
            .returns(underlyingBalance);
          const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
          expect(underlyingBalance).to.equal(result);
        },
      );
    });

    context("when the underlying has 6 decimals", function () {
      beforeEach(async function () {
        await this.contracts.hifiPool.__godMode_setUnderlyingPrecisionScalar(USDC_PRICE_PRECISION_SCALAR);
      });

      const testSets = [[USDC("1e-6")], [USDC("1e2")], [USDC("1729")], [USDC("31415.92")], [USDC(MAX_UD60x18)]];

      forEach(testSets).it(
        "takes %e and returns the correct underlying reserves",
        async function (underlyingBalance: BigNumber) {
          await this.mocks.underlying.mock.balanceOf
            .withArgs(this.contracts.hifiPool.address)
            .returns(underlyingBalance);
          const result: BigNumber = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
          expect(underlyingBalance.mul(USDC_PRICE_PRECISION_SCALAR)).to.equal(result);
        },
      );
    });
  });
}
