import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  it("retrieves the collateral precision scalar", async function () {
    const collateralPrecisionScalar: BigNumber = await this.contracts.yToken.collateralPrecisionScalar();
    /* It's 1 because the collateral has 18 decimals, just like any yToken. */
    expect(collateralPrecisionScalar).to.equal(BigNumber.from(1));
  });
}
