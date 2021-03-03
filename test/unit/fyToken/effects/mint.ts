import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FyTokenErrors } from "../../../../helpers/errors";
import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const mintAmount: BigNumber = tokenAmounts.oneHundred;

  describe("when the caller is not the fyToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fyToken.connect(this.signers.raider).mint(this.signers.raider.address, mintAmount),
      ).to.be.revertedWith(FyTokenErrors.MintNotAuthorized);
    });
  });
}
