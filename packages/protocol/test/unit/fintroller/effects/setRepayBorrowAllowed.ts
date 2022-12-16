import { FintrollerErrors, OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetRepayBorrowAllowed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setRepayBorrowAllowed(this.mocks.hTokens[0].address, true),
        ).to.be.revertedWith(FintrollerErrors.BOND_NOT_LISTED);
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

      context("sets the value to false", async function () {
        context("when liquidateBorrow is allowed", function () {
          beforeEach(async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .__godMode_setLiquidateBorrowAllowed(this.mocks.hTokens[0].address, true);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setRepayBorrowAllowed(this.mocks.hTokens[0].address, false),
            ).to.be.revertedWith(FintrollerErrors.BOND_REPAY_BORROW_DISALLOWED_WITH_LIQUIDATE_BORROW_ALLOWED);
          });
        });

        context("when liquidateBorrow is disallowed", function () {
          beforeEach(async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .__godMode_setLiquidateBorrowAllowed(this.mocks.hTokens[0].address, false);
          });

          it("succeeds", async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setRepayBorrowAllowed(this.mocks.hTokens[0].address, false);
            const newState: boolean = await this.contracts.fintroller.getRepayBorrowAllowed(
              this.mocks.hTokens[0].address,
            );
            expect(newState).to.equal(false);
          });
        });
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
