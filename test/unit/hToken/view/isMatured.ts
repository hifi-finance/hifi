import { expect } from "chai";

import { now } from "../../../../helpers/time";

export default function shouldBehaveLikeIsMatured(): void {
  context("when the expiration time is after now", function () {
    it("returns false", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(false).to.equal(isMatured);
    });
  });

  context("when the expiration time is not after now", function () {
    beforeEach(async function () {
      await this.contracts.hTokens[0].__godMode_setExpirationTime(now().sub(3600));
    });

    it("returns true", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(true).to.equal(isMatured);
    });
  });
}
