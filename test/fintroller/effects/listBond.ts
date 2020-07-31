import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeListBond(): void {
  describe("when the contract to be listed is compliant", function () {
    // it.only("lists the new bond", async function () {
    //   await this.fintroller.listBond("0x0000000000000000000000000000000000000000");
    // });
  });

  describe("when the contract to be listed is non-compliant", function () {
    it("rejects", async function () {
      await expect(this.fintroller.listBond(AddressZero)).to.be.reverted;
    });
  });
}
