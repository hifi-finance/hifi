import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingGetter(): void {
  it("retrieves the contract address of the underlying asset", async function () {
    const underlyingAddress: string = await this.contracts.yToken.underlying();
    expect(underlyingAddress).to.equal(this.stubs.underlying.address);
  });
}
