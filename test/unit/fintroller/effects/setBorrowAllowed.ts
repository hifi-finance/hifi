import { expect } from "chai";

import { AdminErrors, GenericErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetBorrowAllowed(): void {
  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).setBorrowAllowed(this.mocks.hTokens[0].address, true),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.mocks.hTokens[0].address, true),
        ).to.be.revertedWith(GenericErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setBorrowAllowed(this.mocks.hTokens[0].address, true);
        const newState: boolean = await this.contracts.fintroller.getBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setBorrowAllowed(this.mocks.hTokens[0].address, false);
        const newState: boolean = await this.contracts.fintroller.getBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(false);
      });

      it("emits a SetBorrowAllowed event", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.mocks.hTokens[0].address, true),
        )
          .to.emit(this.contracts.fintroller, "SetBorrowAllowed")
          .withArgs(this.signers.admin.address, this.mocks.hTokens[0].address, true);
      });
    });
  });
}
