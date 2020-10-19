import { BigNumber } from "@ethersproject/bignumber";
import { One } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  it("retrieves the collateral precision scalar", async function () {
    const collateralPrecisionScalar: BigNumber = await this.contracts.yToken.collateralPrecisionScalar();
    expect(collateralPrecisionScalar).to.equal(One);
  });
}
