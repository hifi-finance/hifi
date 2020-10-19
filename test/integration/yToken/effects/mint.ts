import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { YTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeMint(): void {
  describe("when the amount to mint is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.redemptionPool.__godMode_mintYTokens(Zero)).to.be.revertedWith(YTokenErrors.MintZero);
    });
  });
}
