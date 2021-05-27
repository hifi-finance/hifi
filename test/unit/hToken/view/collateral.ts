import { expect } from "chai";

export default function shouldBehaveLikeCollateralGetter(): void {
  it("retrieves the contract address of the collateral", async function () {
    const collateralAddress: string = await this.contracts.hToken.collateral();
    expect(collateralAddress).to.equal(this.stubs.collateral.address);
  });
}
