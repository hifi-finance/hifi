import { unitFixtureHifiPoolRegistry } from "../../shared/fixtures";
import { shouldBehaveLikeHifiPoolRegistry } from "./HifiPoolRegistry.behavior";

export function unitTestHifiPoolRegistry(): void {
  describe("HifiPoolRegistry", function () {
    beforeEach(async function () {
      const { hToken, hifiPool, hifiPoolRegistry } = await this.loadFixture(unitFixtureHifiPoolRegistry);
      this.contracts.hifiPoolRegistry = hifiPoolRegistry;
      this.mocks.hifiPool = hifiPool;
      this.mocks.hToken = hToken;
    });

    shouldBehaveLikeHifiPoolRegistry();
  });
}
