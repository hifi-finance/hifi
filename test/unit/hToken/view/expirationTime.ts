import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { hTokenConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const expirationTime: BigNumber = await this.contracts.hToken.expirationTime();
    expect(expirationTime).to.equal(hTokenConstants.expirationTime);
  });
}
