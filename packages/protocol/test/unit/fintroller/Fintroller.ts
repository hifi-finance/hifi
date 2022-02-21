import { unitFixtureFintroller } from "../../shared/fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function unitTestFintroller(): void {
  describe.skip("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, hTokens, wbtc } = await this.loadFixture(unitFixtureFintroller);
      this.contracts.fintroller = fintroller;
      this.mocks.hTokens = hTokens;
      this.mocks.wbtc = wbtc;
    });

    shouldBehaveLikeFintroller();
  });
}
