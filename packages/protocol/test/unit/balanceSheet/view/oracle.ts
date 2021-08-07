import { expect } from "chai";

export default function shouldBehaveLikeOracleGetter(): void {
  it("retrieves the address of the oracle contract", async function () {
    const oracle = await this.contracts.balanceSheet.oracle();
    expect(oracle).to.equal(this.mocks.oracle.address);
  });
}
