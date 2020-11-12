import { shouldBehaveLikeRedemptionPool } from "./RedemptionPool.behavior";
import { unitFixtureRedemptionPool } from "../fixtures";

export function unitTestRedemptionPool(): void {
  describe("RedemptionPool", function () {
    beforeEach(async function () {
      const { fintroller, redemptionPool, underlying, fyToken } = await this.loadFixture(unitFixtureRedemptionPool);
      this.contracts.redemptionPool = redemptionPool;
      this.stubs.fintroller = fintroller;
      this.stubs.underlying = underlying;
      this.stubs.fyToken = fyToken;
    });

    shouldBehaveLikeRedemptionPool();
  });
}
