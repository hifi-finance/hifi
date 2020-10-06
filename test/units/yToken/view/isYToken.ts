import { expect } from "chai";

export default function shouldBehaveLikeIsYTokenGetter(): void {
  it("retrieves true", async function () {
    const isYToken: boolean = await this.contracts.yToken.isYToken();
    expect(isYToken).to.equal(true);
  });
}
