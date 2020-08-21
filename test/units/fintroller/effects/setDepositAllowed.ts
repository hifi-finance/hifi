import { expect } from "chai";

import { Errors, FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeSetDepositAllowed(): void {
  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
      });

      it("sets the value of the property to true", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).setDepositAllowed(this.stubs.yToken.address, true);
        const newState: boolean = await this.contracts.fintroller.depositAllowed(this.stubs.yToken.address);
        expect(newState).to.equal(true);
      });

      it("sets the value of the property to false", async function () {
        await this.contracts.fintroller.connect(this.signers.admin).setDepositAllowed(this.stubs.yToken.address, false);
        const newState: boolean = await this.contracts.fintroller.depositAllowed(this.stubs.yToken.address);
        expect(newState).to.equal(false);
      });

      it("emits a SetDepositAllowed event", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setDepositAllowed(this.stubs.yToken.address, true),
        )
          .to.emit(this.contracts.fintroller, "SetDepositAllowed")
          .withArgs(this.stubs.yToken.address, true);
      });
    });

    describe("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setDepositAllowed(this.stubs.yToken.address, true),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.eve).setDepositAllowed(this.stubs.yToken.address, true),
      ).to.be.revertedWith(Errors.NotAuthorized);
    });
  });
}
