import { integrationFixtureHifiPool } from "../../shared/fixtures";
import { shouldBehaveLikeHifiPool } from "./HifiPool.behavior";

export function integrationTestHifiPool(): void {
  describe("HifiPool", function () {
    beforeEach(async function () {
      const { hToken, hifiPool, underlying } = await this.loadFixture(integrationFixtureHifiPool);
      this.contracts.hifiPool = hifiPool;
      this.contracts.hToken = hToken;
      this.contracts.underlying = underlying;
    });

    shouldBehaveLikeHifiPool();
  });
}
