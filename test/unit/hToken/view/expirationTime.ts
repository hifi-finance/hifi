import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { H_TOKEN_EXPIRATION_TIMES } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const expirationTime: BigNumber = await this.contracts.hTokens[0].expirationTime();
    expect(expirationTime).to.equal(H_TOKEN_EXPIRATION_TIMES[0]);
  });
}
