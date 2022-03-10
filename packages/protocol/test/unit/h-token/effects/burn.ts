import { BigNumber } from "@ethersproject/bignumber";
import { HTokenErrors } from "@hifi/errors";
import { hUSDC } from "@hifi/helpers";
import { expect } from "chai";

export function shouldBehaveLikeBurn(): void {
  const burnAmount: BigNumber = hUSDC("100");

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hTokens[0].connect(this.signers.raider).burn(this.signers.borrower.address, burnAmount),
      ).to.be.revertedWith(HTokenErrors.BURN_NOT_AUTHORIZED);
    });
  });
}
