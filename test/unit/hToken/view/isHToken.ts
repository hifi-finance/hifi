import { expect } from "chai";

export default function shouldBehaveLikeIsHTokenGetter(): void {
  it("retrieves true", async function () {
    const isHToken: boolean = await this.contracts.hToken.isHToken();
    expect(isHToken).to.equal(true);
  });
}
