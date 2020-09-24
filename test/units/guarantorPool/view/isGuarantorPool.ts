import { expect } from "chai";

export default function shouldBehaveLikeIsRedemptionPoolGetter(): void {
  it("retrieves the state of the 'isGuarantorPool' storage property", async function () {
    const isGuarantorPool: boolean = await this.contracts.guarantorPool.isGuarantorPool();
    expect(isGuarantorPool).to.equal(true);
  });
}
