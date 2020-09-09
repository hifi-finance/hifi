import { fintrollerFixture, loadFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, oracle, yToken } = await loadFixture.call(this)(fintrollerFixture);
      this.contracts.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeFintroller();
  });
}
