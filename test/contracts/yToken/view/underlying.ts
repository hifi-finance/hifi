import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingGetter(): void {
  it("should retrieve the contract address of the underlying asset", async function () {
    const underlying = await this.yToken.underlying();
    expect(underlying).to.be.equal(this.underlying.address);
  });
}
