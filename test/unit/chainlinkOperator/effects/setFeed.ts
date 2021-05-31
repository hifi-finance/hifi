import { expect } from "chai";

import { WBTC_SYMBOL } from "../../../../helpers/constants";
import { AdminErrors, ChainlinkOperatorErrors } from "../../../../helpers/errors";
import { bn } from "../../../../helpers/numbers";

export default function shouldBehaveLikeSetFeed(): void {
  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.oracle
          .connect(this.signers.raider)
          .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    context("when the feed does not have 8 decimals", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.decimals.returns(bn("6"));
      });

      it("reverts", async function () {
        await expect(
          this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address),
        ).to.be.revertedWith(ChainlinkOperatorErrors.FeedIncorrectDecimals);
      });
    });

    context("when the feed has 8 decimals", function () {
      it("sets the feed", async function () {
        await this.contracts.oracle
          .connect(this.signers.admin)
          .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
        const feed = await this.contracts.oracle.getFeed(WBTC_SYMBOL);
        expect(feed[0]).to.equal(this.mocks.wbtc.address); // asset
        expect(feed[1]).to.equal(this.mocks.wbtcPriceFeed.address); // id
        expect(feed[2]).to.equal(true); // isSet
      });

      it("emits a SetFeed event", async function () {
        await expect(
          this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address),
        )
          .to.emit(this.contracts.oracle, "SetFeed")
          .withArgs(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address);
      });
    });
  });
}
