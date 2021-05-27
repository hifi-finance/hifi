import { expect } from "chai";

export default function shouldBehaveLikeHTokenGetter(): void {
  it("retrieves the address of the HToken contract", async function () {
    const hTokenAddress: string = await this.contracts.redemptionPool.hToken();
    expect(hTokenAddress).to.equal(this.stubs.hToken.address);
  });
}
