import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

/* TODO: check the cases when the total liquidity is not zero. */
export default function shouldBehaveLikeTotalGuarantyGetter(): void {
  describe("when the total guaranty is zero", function () {
    it("retrieves zero", async function () {
      const totalGuaranty: BigNumber = await this.contracts.guarantorPool.totalGuaranty();
      expect(totalGuaranty).to.equal(Zero);
    });
  });
}
