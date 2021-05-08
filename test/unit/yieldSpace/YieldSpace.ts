import { unitFixtureYieldSpace } from "../fixtures";
import { shouldBehaveLikeYieldSpace } from "./YieldSpace.behavior";

export function unitTestYieldSpace(): void {
  describe("YieldSpace", function () {
    beforeEach(async function () {
      const { yieldSpace } = await this.loadFixture(unitFixtureYieldSpace);
      this.contracts.yieldSpace = yieldSpace;
    });

    shouldBehaveLikeYieldSpace();
  });
}
