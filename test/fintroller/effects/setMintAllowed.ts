import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors } from "../../errors";

export default function shouldBehaveLikeSetMintAllowed(admin: Wallet): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.fintroller.connect(admin)._listBond(this.yToken.address);
    });

    it("sets the value of the property to true", async function () {
      await this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, true);
      const newState: boolean = await this.fintroller.mintAllowed(this.yToken.address);
      expect(newState).to.be.equal(true);
    });

    it("sets the value of the property to false", async function () {
      await this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, false);
      const newState: boolean = await this.fintroller.mintAllowed(this.yToken.address);
      expect(newState).to.be.equal(false);
    });

    it("emits a SetMintAllowed event", async function () {
      await expect(this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, true))
        .to.emit(this.fintroller, "SetMintAllowed")
        .withArgs(this.yToken.address, true);
    });
  });

  describe("when the bond is not listed", function () {
    it("rejects", async function () {
      await expect(this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, true)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
