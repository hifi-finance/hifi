import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeRedeemableUnderlyingSupplyGetter(): void {
  describe("when the redeemable underlying supply is not zero", function () {
    /* TODO: bump the redeemable underlying supply. */
    it.skip("retrieves the correct amount", async function () {
      const redeemableUnderlyingTotalSupply = await this.contracts.yToken.redeemableUnderlyingTotalSupply();
    });
  });

  describe("when the redeemable underlying supply is zero", function () {
    it("retrieves zero", async function () {
      const redeemableUnderlyingTotalSupply = await this.contracts.yToken.redeemableUnderlyingTotalSupply();
      expect(redeemableUnderlyingTotalSupply).to.equal(Zero);
    });
  });
}
