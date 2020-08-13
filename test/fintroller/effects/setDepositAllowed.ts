import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors } from "../../errors";

export default function shouldBehaveLikeSetDepositAllowed(admin: Wallet): void {
  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.fintroller.connect(admin).listBond(this.yToken.address);
    });

    it("sets the value of the property to true", async function () {
      await this.fintroller.connect(admin).setDepositAllowed(this.yToken.address, true);
      const newState: boolean = await this.fintroller.depositAllowed(this.yToken.address);
      expect(newState).to.be.equal(true);
    });

    it("sets the value of the property to false", async function () {
      await this.fintroller.connect(admin).setDepositAllowed(this.yToken.address, false);
      const newState: boolean = await this.fintroller.depositAllowed(this.yToken.address);
      expect(newState).to.be.equal(false);
    });

    it("emits a SetDepositAllowed event", async function () {
      await expect(this.fintroller.connect(admin).setDepositAllowed(this.yToken.address, true))
        .to.emit(this.fintroller, "SetDepositAllowed")
        .withArgs(this.yToken.address, true);
    });
  });

  describe("when the bond is not listed", function () {
    it("rejects", async function () {
      await expect(this.fintroller.connect(admin).setDepositAllowed(this.yToken.address, true)).to.be.revertedWith(
        FintrollerErrors.BondNotListed,
      );
    });
  });
}
