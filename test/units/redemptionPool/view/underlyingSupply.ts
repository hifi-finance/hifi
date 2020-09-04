import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { BigNumber } from "ethers";

export default function shouldBehaveLikeUnderlyingSupplyGetter(): void {
  describe("when the underlying supply is not zero", function () {
    /* TODO: bump the redeemable underlying supply. */
    // it("retrieves the correct amount", async function () {
    //   const underlyingTotalSupply: BigNumber = await this.contracts.yToken.underlyingTotalSupply();
    // });
  });

  describe("when the underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const underlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.underlyingTotalSupply();
      expect(underlyingTotalSupply).to.equal(Zero);
    });
  });
}
