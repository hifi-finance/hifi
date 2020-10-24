import { expect } from "chai";

export default function shouldBehaveLikeIsRedemptionPoolGetter(): void {
  it("retrieves true", async function () {
    const isRedemptionPool: boolean = await this.contracts.redemptionPool.isRedemptionPool();
    expect(isRedemptionPool).to.equal(true);
  });
}
