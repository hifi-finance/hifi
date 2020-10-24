import { e2eFixture } from "../fixtures";
import { shouldBehaveLikeBalanceSheet } from "./BalanceSheet.behavior";

export function e2eTestBalanceSheet(): void {
  describe("BalanceSheet", function () {
    beforeEach(async function () {
      const {
        balanceSheet,
        collateral,
        fintroller,
        fyToken,
        oracle,
        redemptionPool,
        underlying,
      } = await this.loadFixture(e2eFixture);
      this.contracts.balanceSheet = balanceSheet;
      this.contracts.collateral = collateral;
      this.contracts.fintroller = fintroller;
      this.contracts.fyToken = fyToken;
      this.contracts.oracle = oracle;
      this.contracts.redemptionPool = redemptionPool;
      this.contracts.underlying = underlying;
    });

    shouldBehaveLikeBalanceSheet();
  });
}
