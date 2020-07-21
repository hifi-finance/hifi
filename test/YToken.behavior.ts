import { Wallet } from "@ethersproject/wallet";
// import { expect } from "chai";

export function shouldBehaveLikeYToken(_wallets: Wallet[]): void {
  it("Should return the contract address of the underlying asset", async function () {
    const underlying: string = await this.yToken.underlying();
    console.log({ underlying });
  });
}
