import { loadFixture, redemptionPoolFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeRedemptionPool } from "./RedemptionPool.behavior";

export function testRedemptionPool(): void {
  describe("Redemption Pool", function () {
    beforeEach(async function () {
      const { fintroller, redemptionPool, yToken } = await loadFixture.call(this)(redemptionPoolFixture);
      this.contracts.redemptionPool = redemptionPool;
      this.stubs.fintroller = fintroller;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeRedemptionPool();
  });
}
