import { expect } from "chai";

import { Errors, FintrollerErrors } from "../../errors";

export default function shouldBehaveLikeSetDepositAllowed(): void {
  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(this.admin).listBond(this.yToken.address);
      });

      it("sets the value of the property to true", async function () {
        await this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true);
        const newState: boolean = await this.fintroller.depositAllowed(this.yToken.address);
        expect(newState).to.be.equal(true);
      });

      it("sets the value of the property to false", async function () {
        await this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, false);
        const newState: boolean = await this.fintroller.depositAllowed(this.yToken.address);
        expect(newState).to.be.equal(false);
      });

      it("emits a SetDepositAllowed event", async function () {
        await expect(this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true))
          .to.emit(this.fintroller, "SetDepositAllowed")
          .withArgs(this.yToken.address, true);
      });
    });

    describe("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(this.fintroller.connect(this.eve).setDepositAllowed(this.yToken.address, true)).to.be.revertedWith(
        Errors.NotAuthorized,
      );
    });
  });
}
