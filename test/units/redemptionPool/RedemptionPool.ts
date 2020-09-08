import { waffle } from "@nomiclabs/buidler";

import { redemptionPoolFixture } from "../../helpers/fixtures";
import { shouldBehaveLikeRedemptionPool } from "./RedemptionPool.behavior";

const { loadFixture } = waffle;

export function testRedemptionPool(): void {
  describe("Redemption Pool", function () {
    beforeEach(async function () {
      const { fintroller, redemptionPool, yToken } = await loadFixture(redemptionPoolFixture);
      this.contracts.redemptionPool = redemptionPool;
      this.stubs.fintroller = fintroller;
      this.stubs.yToken = yToken;
    });

    shouldBehaveLikeRedemptionPool();
  });
}
