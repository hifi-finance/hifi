import { MinInt256 } from "@ethersproject/constants";
import { UniswapV3PriceFeedErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetMaxPrice(): void {
  context("when max price is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.uniswapV3priceFeed.connect(this.signers.admin).setMaxPrice(0)).to.be.revertedWith(
        UniswapV3PriceFeedErrors.MAX_PRICE_LESS_THAN_OR_EQUAL_TO_ZERO,
      );
    });
  });

  context("when max price is negative", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.uniswapV3priceFeed.connect(this.signers.admin).setMaxPrice(MinInt256),
      ).to.be.revertedWith(UniswapV3PriceFeedErrors.MAX_PRICE_LESS_THAN_OR_EQUAL_TO_ZERO);
    });
  });

  context("when the max price is greater than zero", function () {
    it("sets the max price of the price feed", async function () {
      await this.contracts.uniswapV3priceFeed.connect(this.signers.admin).setMaxPrice(1);
      const maxPrice = await this.contracts.uniswapV3priceFeed.maxPrice();
      expect(maxPrice).to.equal(1);
    });
  });
}
