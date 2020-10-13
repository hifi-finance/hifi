import { expect } from "chai";

export default function shouldBehaveLikeCollateralGetter(): void {
  it("retrieves the address of the balance sheet contract", async function () {
    const balanceSheetAddress: string = await this.contracts.yToken.balanceSheet();
    expect(balanceSheetAddress).to.equal(this.stubs.balanceSheet.address);
  });
}
