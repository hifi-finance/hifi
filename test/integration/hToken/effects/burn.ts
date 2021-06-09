import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeBurn(): void {
  context("when the amount to burn is zero", function () {
    it("reverts", async function () {
      const burnAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet.__godMode_burnHTokens(this.contracts.hTokens[0].address, burnAmount),
      ).to.be.revertedWith(HTokenErrors.BurnZero);
    });
  });
}
