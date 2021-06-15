import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { usdc } from "../../../../helpers/numbers";

export default function shouldBehaveLikeTotalUnderlyingSupplyGetter(): void {
  const underlyingAmount: BigNumber = usdc("100");

  context("when the underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const totalUnderlyingSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
      expect(totalUnderlyingSupply).to.equal(Zero);
    });
  });

  context("when the total underlying supply is not zero", function () {
    beforeEach(async function () {
      await this.contracts.hTokens[0].__godMode_setTotalUnderlyingSupply(underlyingAmount);
    });

    it("retrieves the correct amount", async function () {
      const totalUnderlyingSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
      expect(totalUnderlyingSupply).to.equal(underlyingAmount);
    });
  });
}
