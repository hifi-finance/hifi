import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingGetter(): void {
  it("retrieves the contract address of the underlying", async function () {
    const underlyingAddress: string = await this.contracts.fyToken.underlying();
    expect(underlyingAddress).to.equal(this.stubs.underlying.address);
  });
}
