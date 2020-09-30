import { loadFixture, guarantorPoolFixture } from "../../fixtures";
import { shouldBehaveLikeGuarantorPool } from "./GuarantorPool.behavior";

export function testGuarantorPool(): void {
  describe("Guarantor Pool", function () {
    beforeEach(async function () {
      const { fintroller, guarantorPool, guaranty, yToken } = await loadFixture.call(this)(guarantorPoolFixture);
      this.stubs.guaranty = guaranty;
      this.contracts.guarantorPool = guarantorPool;
      this.stubs.fintroller = fintroller;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeGuarantorPool();
  });
}
