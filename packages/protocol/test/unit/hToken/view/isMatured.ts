import { BigNumber } from "@ethersproject/bignumber";
import { getNow } from "@hifi/helpers";
import { expect } from "chai";

export default function shouldBehaveLikeIsMatured(): void {
  context("when the maturity is in the future", function () {
    it("returns false", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(false).to.equal(isMatured);
    });
  });

  context("when the maturity is in the past", function () {
    beforeEach(async function () {
      const oneHourAgo: BigNumber = getNow().sub(3600);
      await this.contracts.hTokens[0].__godMode_setMaturity(oneHourAgo);
    });

    it("returns true", async function () {
      const isMatured: boolean = await this.contracts.hTokens[0].isMatured();
      expect(true).to.equal(isMatured);
    });
  });
}
