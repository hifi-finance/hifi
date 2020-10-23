import { expect } from "chai";

export default function shouldBehaveLikeRedemptionPoolGetter(): void {
  it("retrieves the address of the redemption pool contract", async function () {
    const redemptionPoolAddress: string = await this.contracts.fyToken.redemptionPool();
    expect(redemptionPoolAddress).to.equal(this.stubs.redemptionPool.address);
  });
}
