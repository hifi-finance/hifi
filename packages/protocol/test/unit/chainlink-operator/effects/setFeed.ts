import { WBTC_SYMBOL } from "@hifi/constants";
import { ChainlinkOperatorErrors, OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetFeed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.oracle
          .connect(this.signers.raider)
          .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the feed does not have 8 decimals", function () {
      beforeEach(async function () {
        await this.mocks.wbtcPriceFeed.mock.decimals.returns(6);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.mocks.wbtc.address, this.mocks.wbtcPriceFeed.address),
        ).to.be.revertedWith(ChainlinkOperatorErrors.DECIMALS_MISMATCH);
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
