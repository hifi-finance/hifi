import { unitFixtureHifiPool } from "../../shared/fixtures";
import { shouldBehaveLikeHifiPool } from "./HifiPool.behavior";

export function unitTestHifiPool(): void {
  describe("HifiPool", function () {
    beforeEach(async function () {
      const { fyToken, hifiPool, underlying } = await this.loadFixture(unitFixtureHifiPool);
      this.contracts.hifiPool = hifiPool;
      this.mocks.fyToken = fyToken;
      this.mocks.underlying = underlying;
    });

    shouldBehaveLikeHifiPool();
  });
}
