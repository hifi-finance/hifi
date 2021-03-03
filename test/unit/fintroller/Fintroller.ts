import { unitFixtureFintroller } from "../fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

export function unitTestFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, fyToken, oracle } = await this.loadFixture(unitFixtureFintroller);
      this.contracts.fintroller = fintroller;
      this.stubs.fyToken = fyToken;
      this.stubs.oracle = oracle;
    });

    shouldBehaveLikeFintroller();
  });
}
