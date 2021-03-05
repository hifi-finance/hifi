import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { AdminErrors, ChainlinkOperatorErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetFeed(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.oracle
          .connect(this.signers.raider)
          .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the feed does not have 8 decimals", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.decimals.returns(BigNumber.from(6));
      });

      it("reverts", async function () {
        await expect(
          this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address),
        ).to.be.revertedWith(ChainlinkOperatorErrors.FeedIncorrectDecimals);
      });
    });

    describe("when the feed has 8 decimals", function () {
      it("sets the feed", async function () {
        await this.contracts.oracle
          .connect(this.signers.admin)
          .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
        const feed = await this.contracts.oracle.getFeed("WETH");
        expect(feed[0]).to.equal(this.stubs.collateral.address); // asset
        expect(feed[1]).to.equal(this.stubs.collateralPriceFeed.address); // id
        expect(feed[2]).to.equal(true); // isSet
      });

      it("emits a SetFeed event", async function () {
        await expect(
          this.contracts.oracle
            .connect(this.signers.admin)
            .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address),
        )
          .to.emit(this.contracts.oracle, "SetFeed")
          .withArgs(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
      });
    });
  });
}
