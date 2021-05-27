import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { HTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeMint(): void {
  describe("when the amount to mint is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.redemptionPool.__godMode_mintHTokens(Zero)).to.be.revertedWith(HTokenErrors.MintZero);
    });
  });
}
