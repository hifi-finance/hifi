import { fintrollerFixture } from "../../fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, oracle, yToken } = await this.loadFixture(fintrollerFixture);
      this.contracts.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeFintroller();
  });
}
