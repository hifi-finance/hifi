import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { USDC } from "../../../../helpers/numbers";

export default function shouldBehaveLikeTotalUnderlyingReserveGetter(): void {
  const underlyingAmount: BigNumber = USDC("100");

  context("when the underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const totalUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
      expect(totalUnderlyingReserve).to.equal(Zero);
    });
  });

  context("when the total underlying supply is not zero", function () {
    beforeEach(async function () {
      await this.contracts.hTokens[0].__godMode_setTotalUnderlyingReserve(underlyingAmount);
    });

    it("retrieves the correct amount", async function () {
      const totalUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
      expect(totalUnderlyingReserve).to.equal(underlyingAmount);
    });
  });
}
