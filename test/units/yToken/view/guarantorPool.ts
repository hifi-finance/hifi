import { expect } from "chai";

export default function shouldBehaveLikeGuarantorPoolGetter(): void {
  it("retrieves the contract address of the guarantor pool", async function () {
    const guarantorPoolAddress: string = await this.contracts.yToken.guarantorPool();
    expect(guarantorPoolAddress).to.equal(this.stubs.guarantorPool.address);
  });
}
