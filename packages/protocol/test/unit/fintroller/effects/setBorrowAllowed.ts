import { FintrollerErrors, OwnableErrors } from "@hifi/errors";
import { expect } from "chai";

export function shouldBehaveLikeSetBorrowAllowed(): void {
  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).setBorrowAllowed(this.mocks.hTokens[0].address, true),
      ).to.be.revertedWith(OwnableErrors.NOT_OWNER);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("rejects", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.mocks.hTokens[0].address, true),
        ).to.be.revertedWith(FintrollerErrors.BOND_NOT_LISTED);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
      });

      context("sets the value to true", async function () {
        context("when liquidate borrow is allowed", function () {
          beforeEach(async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .__godMode_setLiquidateBorrowAllowed(this.mocks.hTokens[0].address, true);
          });

          it("succeeds", async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setBorrowAllowed(this.mocks.hTokens[0].address, true);
            const newState: boolean = await this.contracts.fintroller.getBorrowAllowed(this.mocks.hTokens[0].address);
            expect(newState).to.equal(true);
          });
        });

        context("when liquidate borrow is disallowed", function () {
          beforeEach(async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .__godMode_setLiquidateBorrowAllowed(this.mocks.hTokens[0].address, false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBorrowAllowed(this.mocks.hTokens[0].address, true),
            ).to.be.revertedWith(FintrollerErrors.BOND_BORROW_ALLOWED_WITH_LIQUIDATE_BORROW_DISALLOWED);
          });
        });
      });

      context("sets the value to false", async function () {
        it("succeeds", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setBorrowAllowed(this.mocks.hTokens[0].address, false);
          const newState: boolean = await this.contracts.fintroller.getBorrowAllowed(this.mocks.hTokens[0].address);
          expect(newState).to.equal(false);
        });
      });

      it("emits a SetBorrowAllowed event", async function () {
        await expect(
          this.contracts.fintroller.connect(this.signers.admin).setBorrowAllowed(this.mocks.hTokens[0].address, false),
        )
          .to.emit(this.contracts.fintroller, "SetBorrowAllowed")
          .withArgs(this.signers.admin.address, this.mocks.hTokens[0].address, false);
      });
    });
  });
}
