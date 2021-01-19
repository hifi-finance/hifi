import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, ChainlinkOperatorErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeDeleteFeed(): void {
  const symbol: string = "WETH";

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.connect(this.signers.raider).deleteFeed(symbol)).to.be.revertedWith(
        AdminErrors.NotAdmin,
      );
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the feed is not set", function () {
      it("reverts", async function () {
        await expect(this.contracts.oracle.connect(this.signers.admin).deleteFeed(symbol)).to.be.revertedWith(
          ChainlinkOperatorErrors.FeedNotSet,
        );
      });
    });

    describe("when the feed is set", function () {
      beforeEach(async function () {
        await this.contracts.oracle
          .connect(this.signers.admin)
          .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
      });

      it("deletes the feed", async function () {
        await this.contracts.oracle.connect(this.signers.admin).deleteFeed(symbol);
        const feed = await this.contracts.oracle.getFeed("WETH");
        expect(feed[0]).to.equal(AddressZero); /* asset */
        expect(feed[1]).to.equal(AddressZero); /* id */
        expect(feed[2]).to.equal(false); /* isSet */
      });

      it("emits a DeleteFeed event", async function () {
        await expect(this.contracts.oracle.connect(this.signers.admin).deleteFeed(symbol))
          .to.emit(this.contracts.oracle, "DeleteFeed")
          .withArgs(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
      });
    });
  });
}
