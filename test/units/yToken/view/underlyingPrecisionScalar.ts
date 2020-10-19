import { BigNumber } from "@ethersproject/bignumber";
import { One } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeUnderlyingPrecisionScalarGetter(): void {
  it("retrieves the underlying precision scalar", async function () {
    const underlyingPrecisionScalar: BigNumber = await this.contracts.yToken.underlyingPrecisionScalar();
    expect(underlyingPrecisionScalar).to.equal(One);
  });
}
