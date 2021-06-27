import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { H_TOKEN_MATURITIES } from "../../../../helpers/constants";

export default function shouldBehaveLikeMaturityGetter(): void {
  it("retrieves the maturity", async function () {
    const maturity: BigNumber = await this.contracts.hTokens[0].maturity();
    expect(maturity).to.equal(H_TOKEN_MATURITIES[0]);
  });
}
