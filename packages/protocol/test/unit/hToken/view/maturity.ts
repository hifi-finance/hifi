import { BigNumber } from "@ethersproject/bignumber";
import { H_TOKEN_MATURITY_THREE_MONTHS } from "@hifi/constants";
import { expect } from "chai";

export default function shouldBehaveLikeMaturityGetter(): void {
  it("retrieves the maturity", async function () {
    const maturity: BigNumber = await this.contracts.hTokens[0].maturity();
    expect(maturity).to.equal(H_TOKEN_MATURITY_THREE_MONTHS);
  });
}
