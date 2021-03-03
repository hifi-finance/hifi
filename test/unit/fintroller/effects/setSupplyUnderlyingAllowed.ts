import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetSupplyUnderlyingAllowed(): void {
  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setSupplyUnderlyingAllowed(this.stubs.fyToken.address, true),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setSupplyUnderlyingAllowed(this.stubs.fyToken.address, true),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setSupplyUnderlyingAllowed(this.stubs.fyToken.address, true);
        const newState: boolean = await this.contracts.fintroller.getSupplyUnderlyingAllowed(
          this.stubs.fyToken.address,
        );
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setSupplyUnderlyingAllowed(this.stubs.fyToken.address, false);
        const newState: boolean = await this.contracts.fintroller.getSupplyUnderlyingAllowed(
          this.stubs.fyToken.address,
        );
        expect(newState).to.equal(false);
      });

      it("emits a SetSupplyUnderlyingAllowed event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setSupplyUnderlyingAllowed(this.stubs.fyToken.address, true),
        )
          .to.emit(this.contracts.fintroller, "SetSupplyUnderlyingAllowed")
          .withArgs(this.signers.admin.address, this.stubs.fyToken.address, true);
      });
    });
  });
}
