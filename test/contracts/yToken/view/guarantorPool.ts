import { expect } from "chai";

export default function shouldBehaveLikeGetGuarantorPool(): void {
  it("should retrieve the contract address of the guarantor pool", async function () {
    const guarantorPool = await this.yToken.guarantorPool();
    expect(guarantorPool).to.be.equal(this.guarantorPool.address);
  });
}
