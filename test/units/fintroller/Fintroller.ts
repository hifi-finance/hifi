import { waffle } from "@nomiclabs/buidler";

import { deployStubYToken } from "../../helpers/stubs";
import { fintrollerFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeFintroller } from "./Fintroller.behavior";

const { loadFixture } = waffle;

export function testFintroller(): void {
  describe("Fintroller", function () {
    beforeEach(async function () {
      const { fintroller } = await loadFixture(fintrollerFixture);
      this.contracts.fintroller = fintroller;
      this.stubs.yToken = await deployStubYToken(this.signers.admin);
    });

    shouldBehaveLikeFintroller();
  });
}
