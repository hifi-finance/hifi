import { expect } from "chai";

export default function shouldBehaveLikeFintrollerGetter(): void {
  it("retrieves the address of the fintroller contract", async function () {
    const fintrollerAddress: string = await this.contracts.balanceSheet.fintroller();
    expect(fintrollerAddress).to.equal(this.stubs.fintroller.address);
  });
}
