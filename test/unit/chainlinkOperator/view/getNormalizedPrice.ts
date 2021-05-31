import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { COLLATERAL_SYMBOL, MAX_INT256 } from "../../../../helpers/constants";
import { ChainlinkOperatorErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikegetNormalizedPrice(): void {
  context("when the feed is not set", function () {
    it("reverts", async function () {
      await expect(this.contracts.oracle.getNormalizedPrice("FOO")).to.be.revertedWith(
        ChainlinkOperatorErrors.FeedNotSet,
      );
    });
  });

  context("when the feed is set", function () {
    beforeEach(async function () {
      await this.contracts.oracle
        .connect(this.signers.admin)
        .setFeed(this.stubs.collateral.address, this.stubs.collateralPriceFeed.address);
    });

    context("when the multiplication overflows uint256", function () {
      beforeEach(async function () {
        await this.stubs.collateralPriceFeed.mock.latestRoundData.returns(Zero, MAX_INT256, Zero, Zero, Zero);
      });

      it("reverts", async function () {
        await expect(this.contracts.oracle.getNormalizedPrice(COLLATERAL_SYMBOL)).to.be.reverted;
      });
    });

    context("when the multiplication does not overflow uint256", function () {
      it("retrieves the normalized price", async function () {
        const normalizedPrice: BigNumber = await this.contracts.oracle.getNormalizedPrice(COLLATERAL_SYMBOL);
        expect(normalizedPrice).to.equal(fp("100"));
      });
    });
  });
}
