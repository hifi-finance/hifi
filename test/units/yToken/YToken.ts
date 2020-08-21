import { waffle } from "@nomiclabs/buidler";

import { yTokenFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeYToken } from "./YToken.behavior";

const { loadFixture } = waffle;

export function testYToken(): void {
  describe("YToken", function () {
    beforeEach(async function () {
      const { collateral, fintroller, guarantorPool, oracle, underlying, yToken } = await loadFixture(yTokenFixture);
      this.stubs.collateral = collateral;
      this.stubs.fintroller = fintroller;
      this.stubs.guarantorPool = guarantorPool;
      this.stubs.oracle = oracle;
      this.stubs.underlying = underlying;
      this.contracts.yToken = yToken;
    });

    shouldBehaveLikeYToken();
  });
}
