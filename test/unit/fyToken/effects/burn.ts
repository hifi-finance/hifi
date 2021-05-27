import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { tokenAmounts } from "../../../../helpers/constants";
import { FyTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const burnAmount: BigNumber = tokenAmounts.oneHundred;

  describe("when the caller is not the FyToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fyToken.connect(this.signers.raider).burn(this.signers.borrower.address, burnAmount),
      ).to.be.revertedWith(FyTokenErrors.BurnNotAuthorized);
    });
  });
}
