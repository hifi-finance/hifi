import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";
import { HTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const mintAmount: BigNumber = tokenAmounts.oneHundred;

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hToken.connect(this.signers.raider).mint(this.signers.raider.address, mintAmount),
      ).to.be.revertedWith(HTokenErrors.MintNotAuthorized);
    });
  });
}
