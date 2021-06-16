import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { HTokenErrors } from "../../../shared/errors";
import { hUSDC } from "../../../../helpers/numbers";

export default function shouldBehaveLikeMint(): void {
  const mintAmount: BigNumber = hUSDC("100");

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hTokens[0].connect(this.signers.raider).mint(this.signers.raider.address, mintAmount),
      ).to.be.revertedWith(HTokenErrors.MintNotAuthorized);
    });
  });
}
