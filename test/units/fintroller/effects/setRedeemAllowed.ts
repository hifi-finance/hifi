import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeSetRedeemAllowed(): void {
  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
      });

      it("sets the value of the property to true", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).setRedeemAllowed(this.stubs.yToken.address, true);
        const newState: boolean = await this.contracts.fintroller.redeemAllowed(this.stubs.yToken.address);
        expect(newState).to.equal(true);
      });

      it("sets the value of the property to false", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).setRedeemAllowed(this.stubs.yToken.address, false);
        const newState: boolean = await this.contracts.fintroller.redeemAllowed(this.stubs.yToken.address);
        expect(newState).to.equal(false);
      });

      it("emits a SetRedeemAllowed event", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setRedeemAllowed(this.stubs.yToken.address, true),
        )
          .to.emit(this.contracts.fintroller, "SetRedeemAllowed")
          .withArgs(this.stubs.yToken.address, true);
      });
    });

    describe("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setRedeemAllowed(this.stubs.yToken.address, true),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.eve).setRedeemAllowed(this.stubs.yToken.address, true),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });
}
