import { expect } from "chai";

export default function shouldBehaveLikeCollateralGetter(): void {
  it("retrieves the contract address of the collateral asset", async function () {
    const collateral = await this.yToken.collateral();
    expect(collateral).to.equal(this.collateral.address);
  });
}
