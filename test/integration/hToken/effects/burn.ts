import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { HTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeBurn(): void {
  describe("when the amount to burn is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.redemptionPool.__godMode_burnHTokens(Zero)).to.be.revertedWith(HTokenErrors.BurnZero);
    });
  });
}
