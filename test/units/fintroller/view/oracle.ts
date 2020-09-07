import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeOracleStorageGetter(): void {
  it("retrieves the address of the oracle contract", async function () {
    const oracle = await this.contracts.fintroller.oracle();
    expect(oracle).to.equal(AddressZero);
  });
}
