import { expect } from "chai";

export default function shouldBehaveLikeIsFyTokenGetter(): void {
  it("retrieves true", async function () {
    const isFyToken: boolean = await this.contracts.fyToken.isFyToken();
    expect(isFyToken).to.equal(true);
  });
}
