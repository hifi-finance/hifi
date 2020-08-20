import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const expirationTime: BigNumber = await this.yToken.expirationTime();
    expect(expirationTime).to.equal(this.scenario.yToken.expirationTime);
  });
}
