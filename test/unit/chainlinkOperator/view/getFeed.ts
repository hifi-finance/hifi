import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetFeed(): void {
  describe("when the feed is not set", function () {
    it("retrieves the default values", async function () {
      const feed = await this.contracts.oracle.getFeed("FOO");
      expect(feed[0]).to.equal(AddressZero); /* asset */
      expect(feed[1]).to.equal(AddressZero); /* id */
      expect(feed[2]).to.equal(false); /* isSet */
    });
  });

  describe("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.stubs.collateral.address, this.stubs.collateralUsdFeed.address);
    });

    it("retrieves the storage properties of the feed", async function () {
      const feed = await this.contracts.oracle.getFeed("WETH");
      expect(feed[0]).to.equal(this.stubs.collateral.address); /* asset */
      expect(feed[1]).to.equal(this.stubs.collateralUsdFeed.address); /* id */
      expect(feed[2]).to.equal(true); /* isSet */
    });
  });
}
