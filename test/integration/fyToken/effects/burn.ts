import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FyTokenErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeBurn(): void {
  describe("when the amount to burn is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.redemptionPool.__godMode_burnFyTokens(Zero)).to.be.revertedWith(
        FyTokenErrors.BurnZero,
      );
    });
  });
}
