import { expect } from "chai";

export function shouldBehaveLikeMaxPrice(): void {
  context("when the max price is set", function () {
    beforeEach(async function () {
      this.maxPrice = 1234;
      await this.contracts.uniswapV3priceFeed.__godMode_setMaxPrice(this.maxPrice);
    });

    it("returns the max price", async function () {
      const maxPrice = await this.contracts.uniswapV3priceFeed.maxPrice();
      expect(maxPrice).to.equal(this.maxPrice);
    });
  });
}
