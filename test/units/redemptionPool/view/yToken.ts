import { expect } from "chai";

export default function shouldBehaveLikeYTokenGetter(): void {
  it("retrieves the contract address of the yToken", async function () {
    const yTokenAddress: string = await this.contracts.redemptionPool.yToken();
    expect(yTokenAddress).to.equal(this.stubs.yToken.address);
  });
}
