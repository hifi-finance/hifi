import { expect } from "chai";

export function shouldBehaveLikeFintrollerGetter(): void {
  it("returns the address of the Fintroller contract", async function () {
    const fintrollerAddress: string = await this.contracts.hTokens[0].fintroller();
    expect(fintrollerAddress).to.equal(this.mocks.fintroller.address);
  });
}
