import { expect } from "chai";

export default function shouldBehaveLikeYTokenGetter(): void {
  it("retrieves the address of the yToken contract", async function () {
    const yTokenAddress: string = await this.contracts.redemptionPool.yToken();
    expect(yTokenAddress).to.equal(this.stubs.yToken.address);
  });
}
