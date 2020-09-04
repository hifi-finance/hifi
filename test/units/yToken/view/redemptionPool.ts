import { expect } from "chai";

export default function shouldBehaveLikeRedemptionPoolGetter(): void {
  it("retrieves the contract address of the redemption pool", async function () {
    const redemptionPoolAddress: string = await this.contracts.yToken.redemptionPool();
    expect(redemptionPoolAddress).to.equal(this.stubs.redemptionPool.address);
  });
}
