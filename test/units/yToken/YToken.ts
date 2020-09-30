import { loadFixture, yTokenFixture } from "../../fixtures";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

export function testYToken(): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        fintroller,
        guarantorPool,
        oracle,
        redemptionPool,
        underlying,
        yToken,
      } = await loadFixture.call(this)(yTokenFixture);
      this.contracts.yToken = yToken;
      this.stubs.balanceSheet = balanceSheet;
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.guarantorPool = guarantorPool;
      this.stubs.oracle = oracle;
      this.stubs.redemptionPool = redemptionPool;
      this.stubs.underlying = underlying;
    });

    shouldBehaveLikeYToken();
  });
}
