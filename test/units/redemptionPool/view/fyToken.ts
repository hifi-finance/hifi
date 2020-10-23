import { expect } from "chai";

export default function shouldBehaveLikeFyTokenGetter(): void {
  it("retrieves the address of the fyToken contract", async function () {
    const fyTokenAddress: string = await this.contracts.redemptionPool.fyToken();
    expect(fyTokenAddress).to.equal(this.stubs.fyToken.address);
  });
}
