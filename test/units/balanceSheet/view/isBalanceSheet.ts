import { expect } from "chai";

export default function shouldBehaveLikeIsBalanceSheetGetter(): void {
  it("retrieves the state of the 'isBalanceSheet' storage property", async function () {
    const isBalanceSheet: boolean = await this.contracts.balanceSheet.isBalanceSheet();
    expect(isBalanceSheet).to.equal(true);
  });
}
