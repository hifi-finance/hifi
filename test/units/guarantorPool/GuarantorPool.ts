import { loadFixture, guarantorPoolFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeGuarantorPool } from "./GuarantorPool.behavior";

export function testGuarantorPool(): void {
  describe.only("Guarantor Pool", function () {
    beforeEach(async function () {
      const { asset, fintroller, guarantorPool, yToken } = await loadFixture.call(this)(guarantorPoolFixture);
      this.stubs.asset = asset;
      this.contracts.guarantorPool = guarantorPool;
      this.stubs.fintroller = fintroller;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeGuarantorPool();
  });
}
