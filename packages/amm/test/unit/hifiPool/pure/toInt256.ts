import { BigNumber } from "@ethersproject/bignumber";
import { MAX_INT256 } from "@hifi/constants";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { HifiPoolErrors } from "../../../shared/errors";

export default function shouldBehaveLikeToInt256(): void {
  context("when x is bigger than max int256", function () {
    it("reverts", async function () {
      const x: BigNumber = fp(MAX_INT256).add(1);
      await expect(this.contracts.hifiPool.__godMode_toInt256(x)).to.be.revertedWith(
        HifiPoolErrors.ToInt256CastOverflow,
      );
    });
  });

  context("when x is less than or equal to max int256", function () {
    const testSets = [["0"], ["1729"], [MAX_INT256]];

    forEach(testSets).it("converts x to int256", async function (x: string) {
      const result: BigNumber = await this.contracts.hifiPool.__godMode_toInt256(fp(x));
      const expected: BigNumber = fp(x);
      expect(expected).to.equal(result);
    });
  });
}
