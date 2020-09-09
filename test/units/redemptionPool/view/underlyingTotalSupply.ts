import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeUnderlyingSupplyGetter(): void {
  const underlyingAmount: BigNumber = TenTokens;

  describe("when the underlying supply is not zero", function () {
    beforeEach(async function () {
      await this.contracts.redemptionPool.__godMode_setUnderlyingTotalSupply(underlyingAmount);
    });

    it("retrieves the correct amount", async function () {
      const underlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.underlyingTotalSupply();
      expect(underlyingTotalSupply).to.equal(underlyingAmount);
    });
  });

  describe("when the underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const zeroUnderlyingAmount: BigNumber = Zero;
      const underlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.underlyingTotalSupply();
      expect(underlyingTotalSupply).to.equal(zeroUnderlyingAmount);
    });
  });
}
