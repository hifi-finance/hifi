import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { YTokenErrors } from "../../../../helpers/errors";
import { TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const mintAmount: BigNumber = TokenAmounts.OneHundred;

  describe("when the caller is not the yToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.raider).mint(this.accounts.raider, mintAmount),
      ).to.be.revertedWith(YTokenErrors.MintNotAuthorized);
    });
  });
}
