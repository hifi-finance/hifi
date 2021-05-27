import { integrationFixture } from "../fixtures";
import { shouldBehaveLikeRedemptionPool } from "./RedemptionPool.behavior";

export function integrationTestRedemptionPool(): void {
  describe("RedemptionPool", function () {
    beforeEach(async function () {
      const { balanceSheet, fintroller, oracle, redemptionPool, underlying, hToken } = await this.loadFixture(
        integrationFixture,
      );
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.fintroller = fintroller;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.oracle = oracle;
      this.contracts.underlying = underlying;
      this.contracts.hToken = hToken;
    });

    shouldBehaveLikeRedemptionPool();
  });
}
