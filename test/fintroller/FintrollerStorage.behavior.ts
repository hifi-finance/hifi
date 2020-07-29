import { AddressZero, Zero } from "@ethersproject/constants";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

export function shouldBehaveLikeFintrollerStorage(_wallets: Wallet[]): void {
  it("should retrieve the collateralization ratio", async function() {
    const collateralizationRatio = await this.fintroller.collateralizationRatio();
    expect(collateralizationRatio).to.equal(Zero);
  });

  it("should retrieve the contract address of the oracle", async function () {
    const oracle = await this.fintroller.oracle();
    expect(oracle).to.be.equal(AddressZero);
  });
}
