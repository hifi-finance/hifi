import { loadFixture, redemptionPoolFixture } from "../../fixtures";
import { shouldBehaveLikeRedemptionPool } from "./RedemptionPool.behavior";

export function testRedemptionPool(): void {
  describe("Redemption Pool", function () {
    beforeEach(async function () {
      const { fintroller, redemptionPool, underlying, yToken } = await loadFixture.call(this)(redemptionPoolFixture);
      this.contracts.redemptionPool = redemptionPool;
      this.stubs.fintroller = fintroller;
      this.stubs.underlying = underlying;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeRedemptionPool();
  });
}
