import { waffle } from "@nomiclabs/buidler";

import { fintrollerFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

const { loadFixture } = waffle;

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller, oracle, yToken } = await loadFixture(fintrollerFixture);
      this.contracts.fintroller = fintroller;
      this.stubs.oracle = oracle;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeFintroller();
  });
}
