import { AddressZero, Zero } from "@ethersproject/constants";
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

export function shouldBehaveLikeYTokenStorage(): void {
  it("should retrieve the contract address of the collateral asset", async function () {
    const collateral = await this.yToken.collateral();
    expect(collateral).to.be.equal(this.collateral.address);
  });

  it("should retrieve the collateralization ratio", async function() {
    const collateralizationRatio = await this.yToken.collateralizationRatio();
    expect(collateralizationRatio).to.equal(Zero);
  });

  it("should retrieve the expiration time", async function () {
    const expirationTime: BigNumber = await this.yToken.expirationTime();
    expect(expirationTime).to.be.equal(this.scenario.yToken.expirationTime);
  });

  it("should retrieve the contract address of the guarantor pool", async function () {
    const guarantorPool = await this.yToken.guarantorPool();
    expect(guarantorPool).to.be.equal(this.guarantorPool.address);
  });

  it("should retrieve the contract address of the oracle", async function () {
    const oracle = await this.yToken.oracle();
    expect(oracle).to.be.equal(AddressZero);
  });

  it("should retrieve the contract address of the underlying asset", async function () {
    const underlying = await this.yToken.underlying();
    expect(underlying).to.be.equal(this.underlying.address);
  });
}
