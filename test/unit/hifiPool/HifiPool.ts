import { unitFixtureHifiPool } from "../../shared/fixtures";
import { shouldBehaveLikeHifiPool } from "./HifiPool.behavior";

export function unitTestHifiPool(): void {
  describe("HifiPool", function () {
    beforeEach(async function () {
      const { hToken, hifiPool, underlying } = await this.loadFixture(unitFixtureHifiPool);
      this.contracts.hifiPool = hifiPool;
      this.mocks.hToken = hToken;
      this.mocks.underlying = underlying;
    });

    shouldBehaveLikeHifiPool();
  });
}
