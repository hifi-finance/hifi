import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants } from "../../../utils/constants";

export default function shouldBehaveLikeOraclePrecisionScalarGetter(): void {
  it("retrieves the oracle precision scalar", async function () {
    const oraclePricePrecisionScalar: BigNumber = await this.contracts.fintroller.oraclePricePrecisionScalar();
    /* It's always 1e12 because the oracle returns prices with 6 decimals. */
    expect(oraclePricePrecisionScalar).to.equal(FintrollerConstants.OraclePrecisionScalar);
  });
}
