import { expect } from "chai";

import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export function shouldBehaveLikeSetRepayBorrowAllowed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true);
        const newState: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, false);
        const newState: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(false);
      });

      it("emits a SetRepayBorrowAllowed event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
        )
          .to.emit(this.contracts.fintroller, "SetRepayBorrowAllowed")
          .withArgs(this.signers.admin.address, this.mocks.hTokens[0].address, true);
      });
    });
  });
}
