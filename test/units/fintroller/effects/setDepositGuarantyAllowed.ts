import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeSetDepositGuarantyAllowed(): void {
  describe("when the caller is the admin", function () {
    describe("when the pool is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listGuarantorPool(this.stubs.guarantorPool.address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setDepositGuarantyAllowed(this.stubs.guarantorPool.address, true);
        const newState: boolean = await this.contracts.fintroller.depositGuarantyAllowed(
          this.stubs.guarantorPool.address,
        );
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setDepositGuarantyAllowed(this.stubs.guarantorPool.address, false);
        const newState: boolean = await this.contracts.fintroller.depositGuarantyAllowed(
          this.stubs.guarantorPool.address,
        );
        expect(newState).to.equal(false);
      });

      it("emits a SetDepositGuarantyAllowed event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDepositGuarantyAllowed(this.stubs.guarantorPool.address, true),
        )
          .to.emit(this.contracts.fintroller, "SetDepositGuarantyAllowed")
          .withArgs(this.accounts.admin, this.stubs.guarantorPool.address, true);
      });
    });

    describe("when the pool is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDepositGuarantyAllowed(this.stubs.guarantorPool.address, true),
        ).to.be.revertedWith(FintrollerErrors.GuarantorPoolNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.eve)
          .setDepositGuarantyAllowed(this.stubs.guarantorPool.address, true),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });
}
