import { unitFixtureHToken } from "../../shared/fixtures";
import { shouldBehaveLikeHToken } from "./HToken.behavior";

export function unitTestHToken(): void {
  describe("HToken", function () {
    beforeEach(async function () {
      const { balanceSheet, hTokens, oracle, usdc } = await this.loadFixture(unitFixtureHToken);
      this.contracts.hTokens = hTokens;
      this.mocks.balanceSheet = balanceSheet;
      this.mocks.oracle = oracle;
      this.mocks.usdc = usdc;
    });

    shouldBehaveLikeHToken();
  });
}
