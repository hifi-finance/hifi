import { shouldBehaveLikeYToken } from "./YToken.behavior";
import { integrationFixture } from "../fixtures";

export function integrationTestYToken(): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        yToken,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
      this.contracts.yToken = yToken;
    });

    shouldBehaveLikeYToken();
  });
}
