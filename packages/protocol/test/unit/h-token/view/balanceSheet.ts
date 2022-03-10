import { expect } from "chai";

export function shouldBehaveLikeBalanceSheetGetter(): void {
  it("returns the address of the BalanceSheet contract", async function () {
    const balanceSheetAddress: string = await this.contracts.hTokens[0].balanceSheet();
    expect(balanceSheetAddress).to.equal(this.mocks.balanceSheet.address);
  });
}
