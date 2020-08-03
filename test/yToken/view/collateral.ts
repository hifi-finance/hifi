import { expect } from "chai";

export default function shouldBehaveLikeCollateralGetter(): void {
  it("should retrieve the contract address of the collateral asset", async function () {
    const collateral = await this.yToken.collateral();
    expect(collateral).to.be.equal(this.collateral.address);
  });
}
