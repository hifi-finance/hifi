import { unitFixtureFintroller } from "../fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function unitTestFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, oracle, yToken } = await this.loadFixture(unitFixtureFintroller);
      this.contracts.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeFintroller();
  });
}
