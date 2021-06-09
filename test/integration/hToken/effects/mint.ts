import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeMint(): void {
  context("when the amount to mint is zero", function () {
    it("reverts", async function () {
      const mintAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet.__godMode_mintHTokens(this.contracts.hTokens[0].address, mintAmount),
      ).to.be.revertedWith(HTokenErrors.MintZero);
    });
  });
}
