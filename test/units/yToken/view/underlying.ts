import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingGetter(): void {
  it("retrieves the contract address of the underlying asset", async function () {
    const underlying = await this.yToken.underlying();
    expect(underlying).to.equal(this.underlying.address);
  });
}
