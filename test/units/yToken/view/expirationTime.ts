import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { YTokenConstants } from "../../../helpers/constants";

export default function shouldBehaveLikeGetExpirationTime(): void {
  it("retrieves the expiration time", async function () {
    const expirationTime: BigNumber = await this.contracts.yToken.expirationTime();
    expect(expirationTime).to.equal(YTokenConstants.DefaultExpirationTime);
  });
}
