import { expect } from "chai";

export function shouldBehaveLikePool(): void {
  it("returns the Uniswap V3 pool", async function () {
    const pool = await this.contracts.uniswapV3priceFeed.pool();
    expect(pool).to.equal(this.mocks.pool.address);
  });
}
