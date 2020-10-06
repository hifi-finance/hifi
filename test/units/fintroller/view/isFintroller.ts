import { expect } from "chai";

export default function shouldBehaveLikeIsFintrollerGetter(): void {
  it("retrieves true", async function () {
    const isFintroller: boolean = await this.contracts.fintroller.isFintroller();
    expect(isFintroller).to.equal(true);
  });
}
