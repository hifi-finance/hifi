import { AddressZero } from "@ethersproject/constants";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

export default function shouldBehaveLikeListBond(admin: Wallet): void {
  describe("when the contract to be listed is compliant", function () {
    it("lists the new bond", async function () {
      await this.fintroller.connect(admin).listBond(this.yToken.address);
    });

    it("emits a ListBond event", async function () {
      await expect(this.fintroller.connect(admin).listBond(this.yToken.address))
        .to.emit(this.fintroller, "ListBond")
        .withArgs(this.yToken.address);
    });
  });

  describe("when the contract to be listed is non-compliant", function () {
    it("rejects", async function () {
      await expect(this.fintroller.connect(admin).listBond(AddressZero)).to.be.reverted;
    });
  });
}
