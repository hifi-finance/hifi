import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("should retrieve the expiration time", async function () {
    const expirationTime: BigNumber = await this.yToken.expirationTime();
    expect(expirationTime).to.be.equal(this.scenario.yToken.expirationTime);
  });
}
