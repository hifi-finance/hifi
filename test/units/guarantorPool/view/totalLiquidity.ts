import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

/* TODO: check the cases when the total liquidity is not zero. */
export default function shouldBehaveLikeTotalLiquidityGetter(): void {
  describe("when the total liquidity is zero", function () {
    it("retrieves zero", async function () {
      const totalLiquidity: BigNumber = await this.contracts.guarantorPool.totalLiquidity();
      expect(totalLiquidity).to.equal(Zero);
    });
  });
}
