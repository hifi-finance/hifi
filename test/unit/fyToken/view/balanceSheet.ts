import { expect } from "chai";

export default function shouldBehaveLikeCollateralGetter(): void {
  it("retrieves the address of the BalanceSheet contract", async function () {
    const balanceSheetAddress: string = await this.contracts.fyToken.balanceSheet();
    expect(balanceSheetAddress).to.equal(this.stubs.balanceSheet.address);
  });
}
