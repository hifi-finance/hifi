import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { TokenAmounts } from "../../../utils/constants";

export default function shouldBehaveLikeTotalUnderlyingSupplyGetter(): void {
  const underlyingAmount: BigNumber = TokenAmounts.Ten;

  describe("when the total underlying supply is not zero", function () {
    beforeEach(async function () {
      await this.contracts.redemptionPool.__godMode_setTotalUnderlyingSupply(underlyingAmount);
    });

    it("retrieves the correct amount", async function () {
      const totalUnderlyingSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(totalUnderlyingSupply).to.equal(underlyingAmount);
    });
  });

  describe("when the underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const zeroUnderlyingAmount: BigNumber = Zero;
      const totalUnderlyingSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(totalUnderlyingSupply).to.equal(zeroUnderlyingAmount);
    });
  });
}
