import { expect } from "chai";

import { GenericErrors, OwnableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetRepayBorrowAllowed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
      ).to.be.revertedWith(OwnableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.owner)
            .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
        ).to.be.revertedWith(GenericErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.owner).listBond(this.mocks.hTokens[0].address);
      });

      it("sets the value to true", async function () {
        await this.contracts.fintroller
          .connect(this.signers.owner)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true);
        const newState: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(true);
      });

      it("sets the value to false", async function () {
        await this.contracts.fintroller
          .connect(this.signers.owner)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, false);
        const newState: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(this.mocks.hTokens[0].address);
        expect(newState).to.equal(false);
      });

      it("emits a SetRepayBorrowAllowed event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.owner)
            .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
        )
          .to.emit(this.contracts.fintroller, "SetRepayBorrowAllowed")
          .withArgs(this.signers.owner.address, this.mocks.hTokens[0].address, true);
      });
    });
  });
}
