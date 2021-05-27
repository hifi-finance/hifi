import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const expirationTime: BigNumber = await this.contracts.hToken.expirationTime();
    expect(expirationTime).to.equal(H_TOKEN_EXPIRATION_TIME);
  });
}
