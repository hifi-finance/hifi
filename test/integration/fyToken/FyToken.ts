import { shouldBehaveLikeFyToken } from "./FyToken.behavior";
import { integrationFixture } from "../fixtures";

export function integrationTestFyToken(): void {
  describe("FyToken", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        fintroller,
        oracle,
        redemptionPool,
        underlying,
        fyToken,
      } = await this.loadFixture(integrationFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.fintroller = fintroller;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
      this.contracts.fyToken = fyToken;
    });

    shouldBehaveLikeFyToken();
  });
}
