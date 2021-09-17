import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { USDC } from "@hifi/helpers";
import { expect } from "chai";

export default function shouldBehaveLikeTotalUnderlyingReserveGetter(): void {
  const underlyingAmount: BigNumber = USDC("100");

  context("when the underlying supply is zero", function () {
    it("returns zero", async function () {
      const totalUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
      expect(totalUnderlyingReserve).to.equal(Zero);
    });
  });

  context("when the total underlying supply is not zero", function () {
    beforeEach(async function () {
      await this.contracts.hTokens[0].__godMode_setTotalUnderlyingReserve(underlyingAmount);
    });

    it("returns the correct amount", async function () {
      const totalUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
      expect(totalUnderlyingReserve).to.equal(underlyingAmount);
    });
  });
}
