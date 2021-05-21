import { unitFixtureHifiPool } from "../fixtures";
import { shouldBehaveLikeHifiPool } from "./HifiPool.behavior";

export function unitTestHifiPool(): void {
  describe("HifiPool", function () {
    beforeEach(async function () {
      const { fyToken, hifiPool, underlying } = await this.loadFixture(unitFixtureHifiPool);
      this.contracts.hifiPool = hifiPool;
      this.stubs.fyToken = fyToken;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeHifiPool();
  });
}
