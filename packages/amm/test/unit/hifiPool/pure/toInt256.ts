import { BigNumber } from "@ethersproject/bignumber";
import { MaxInt256 } from "@ethersproject/constants";
import { expect } from "chai";
import forEach from "mocha-each";

import { HifiPoolErrors } from "../../../shared/errors";

export function shouldBehaveLikeToInt256(): void {
  context("when x is bigger than max int256", function () {
    it("reverts", async function () {
      const x: BigNumber = MaxInt256.add(1);
      await expect(this.contracts.hifiPool.__godMode_toInt256(x)).to.be.revertedWith(
        HifiPoolErrors.TO_INT256_CAST_OVERFLOW,
      );
    });
  });

  context("when x is less than or equal to max int256", function () {
    const testSets = ["0", "1729", String(MaxInt256)];

    forEach(testSets).it("converts %s to int256", async function (x: string) {
      const result: BigNumber = await this.contracts.hifiPool.__godMode_toInt256(x);
      const expected: BigNumber = BigNumber.from(x);
      expect(expected).to.equal(result);
    });
  });
}
