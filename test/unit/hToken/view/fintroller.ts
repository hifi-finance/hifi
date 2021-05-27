import { expect } from "chai";

export default function shouldBehaveLikeFintrollerGetter(): void {
  it("retrieves the address of the Fintroller contract", async function () {
    const fintrollerAddress: string = await this.contracts.hToken.fintroller();
    expect(fintrollerAddress).to.equal(this.stubs.fintroller.address);
  });
}
