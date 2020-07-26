import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

export function shouldBehaveLikeYToken(_wallets: Wallet[]): void {
  it("should return the contract address of the underlying asset", async function () {
    const underlying = await this.yToken.underlying();
    expect(underlying).to.be.equal(this.underlying.address);
  });
}
