import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingGetter(): void {
  it("returns the contract address of the underlying", async function () {
    const underlyingAddress: string = await this.contracts.hTokens[0].underlying();
    expect(underlyingAddress).to.equal(this.mocks.usdc.address);
  });
}
