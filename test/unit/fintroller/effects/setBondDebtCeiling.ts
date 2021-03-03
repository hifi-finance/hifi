import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";
import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetDebtCeiling(): void {
  const newDebtCeiling: BigNumber = tokenAmounts.oneHundred;

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setBondDebtCeiling(this.stubs.fyToken.address, newDebtCeiling),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setBondDebtCeiling(this.stubs.fyToken.address, newDebtCeiling),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.fyToken.address);
      });

      describe("when the debt ceiling is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.admin).setBondDebtCeiling(this.stubs.fyToken.address, Zero),
          ).to.be.revertedWith(FintrollerErrors.SetBondDebtCeilingZero);
        });
      });

      describe("when the debt ceiling is not zero", function () {
        describe("when the debt ceiling is below the current debt", function () {
          beforeEach(async function () {
            await this.stubs.fyToken.mock.totalSupply.returns(tokenAmounts.oneMillion);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondDebtCeiling(this.stubs.fyToken.address, newDebtCeiling),
            ).to.be.revertedWith(FintrollerErrors.SetBondDebtCeilingUnderflow);
          });
        });

        describe("when the debt ceiling is not below the current debt", function () {
          beforeEach(async function () {
            await this.stubs.fyToken.mock.totalSupply.returns(Zero);
          });

          it("sets the new debt ceiling", async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setBondDebtCeiling(this.stubs.fyToken.address, newDebtCeiling);
            const contractDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(
              this.stubs.fyToken.address,
            );
            expect(contractDebtCeiling).to.equal(newDebtCeiling);
          });

          it("emits a SetBondDebtCeiling event", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondDebtCeiling(this.stubs.fyToken.address, newDebtCeiling),
            )
              .to.emit(this.contracts.fintroller, "SetBondDebtCeiling")
              .withArgs(this.signers.admin.address, this.stubs.fyToken.address, Zero, newDebtCeiling);
          });
        });
      });
    });
  });
}
