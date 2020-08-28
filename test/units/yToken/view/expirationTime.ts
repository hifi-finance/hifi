import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { YTokenConstants } from "../../../helpers/constants";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const storedExpirationTime: BigNumber = await this.contracts.yToken.expirationTime();
    expect(storedExpirationTime).to.equal(YTokenConstants.DefaultExpirationTime);
  });
}
