import { unitFixtureFintroller } from "../fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function unitTestFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, hToken, oracle } = await this.loadFixture(unitFixtureFintroller);
      this.contracts.fintroller = fintroller;
      this.stubs.hToken = hToken;
      this.stubs.oracle = oracle;
    });

    shouldBehaveLikeFintroller();
  });
}
