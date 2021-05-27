import { expect } from "chai";

export default function shouldBehaveLikeRedemptionPoolGetter(): void {
  it("retrieves the address of the RedemptionPool contract", async function () {
    const redemptionPoolAddress: string = await this.contracts.hToken.redemptionPool();
    expect(redemptionPoolAddress).to.equal(this.stubs.redemptionPool.address);
  });
}
