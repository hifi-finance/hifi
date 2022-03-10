import { AddressZero } from "@ethersproject/constants";
import { WBTC_SYMBOL } from "@hifi/constants";
import { ChainlinkOperatorErrors, OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeDeleteFeed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.connect(this.signers.raider).deleteFeed(WBTC_SYMBOL)).to.be.revertedWith(
        OwnableErrors.NOT_OWNER,
      );
    });
  });

  context("when the caller is the owner", function () {
    context("when the feed is not set", function () {
      it("reverts", async function () {
        await expect(this.contracts.oracle.connect(this.signers.admin).deleteFeed(WBTC_SYMBOL)).to.be.revertedWith(
          ChainlinkOperatorErrors.FEED_NOT_SET,
        );
      });
    });

    context("when the feed is set", function () {
      beforeEach(async function () {
        await this.contracts.oracle
          .connect(this.signers.admin)
          .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
      });

      it("deletes the feed", async function () {
        await this.contracts.oracle.connect(this.signers.admin).deleteFeed(WBTC_SYMBOL);
        const feed = await this.contracts.oracle.getFeed(WBTC_SYMBOL);
        expect(feed[0]).to.equal(AddressZero); // asset
        expect(feed[1]).to.equal(AddressZero); // id
        expect(feed[2]).to.equal(false); // isSet
      });

      it("emits a DeleteFeed event", async function () {
        await expect(this.contracts.oracle.connect(this.signers.admin).deleteFeed(WBTC_SYMBOL))
          .to.emit(this.contracts.oracle, "DeleteFeed")
          .withArgs(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
      });
    });
  });
}
