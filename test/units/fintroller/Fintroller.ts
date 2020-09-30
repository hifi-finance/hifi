import { fintrollerFixture, loadFixture, guarantorPoolFixture } from "../../fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, guarantorPool, oracle, yToken } = await loadFixture.call(this)(fintrollerFixture);
      this.contracts.fintroller = fintroller;
      this.stubs.guarantorPool = guarantorPool;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeFintroller();
  });
}
