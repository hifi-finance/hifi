import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  it("retrieves the underlying precision scalar", async function () {
    const underlyingPrecisionScalar: BigNumber = await this.contracts.yToken.underlyingPrecisionScalar();
    /* It's 1 because the collateral has 18 decimals, just like any yToken. */
    expect(underlyingPrecisionScalar).to.equal(BigNumber.from(1));
  });
}
