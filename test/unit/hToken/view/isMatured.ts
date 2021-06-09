import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { now } from "../../../../helpers/time";

export default function shouldBehaveLikeIsMatured(): void {
  context("when the expiration time is in the future", function () {
    it("returns false", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(false).to.equal(isMatured);
    });
  });

  context("when the expiration time is in the past", function () {
    beforeEach(async function () {
      const oneHourAgo: BigNumber = now().sub(3600);
      await this.contracts.hTokens[0].__godMode_setExpirationTime(oneHourAgo);
    });

    it("returns true", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(true).to.equal(isMatured);
    });
  });
}
