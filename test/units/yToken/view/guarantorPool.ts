import { expect } from "chai";

export default function shouldBehaveLikeGuarantorPoolGetter(): void {
  it("retrieves the address of the guarantor pool contract", async function () {
    const guarantorPoolAddress: string = await this.contracts.yToken.guarantorPool();
    expect(guarantorPoolAddress).to.equal(this.stubs.guarantorPool.address);
  });
}
