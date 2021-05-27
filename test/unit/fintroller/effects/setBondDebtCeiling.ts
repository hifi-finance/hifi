import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { AdminErrors, FintrollerErrors, GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetBondDebtCeiling(): void {
  const newDebtCeiling: BigNumber = fp("100");

  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setBondDebtCeiling(this.stubs.hToken.address, newDebtCeiling),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    context("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setBondDebtCeiling(this.stubs.hToken.address, newDebtCeiling),
        ).to.be.revertedWith(GenericErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
      });

      context("when the debt ceiling is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.admin).setBondDebtCeiling(this.stubs.hToken.address, Zero),
          ).to.be.revertedWith(FintrollerErrors.SetBondDebtCeilingZero);
        });
      });

      context("when the debt ceiling is not zero", function () {
        context("when the debt ceiling is below the current debt", function () {
          beforeEach(async function () {
            await this.stubs.hToken.mock.totalSupply.returns(fp("1e7"));
          });

          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondDebtCeiling(this.stubs.hToken.address, newDebtCeiling),
            ).to.be.revertedWith(FintrollerErrors.SetBondDebtCeilingUnderflow);
          });
        });

        context("when the debt ceiling is not below the current debt", function () {
          beforeEach(async function () {
            await this.stubs.hToken.mock.totalSupply.returns(Zero);
          });

          it("sets the new debt ceiling", async function () {
            await this.contracts.fintroller
              .connect(this.signers.admin)
              .setBondDebtCeiling(this.stubs.hToken.address, newDebtCeiling);
            const contractDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(
              this.stubs.hToken.address,
            );
            expect(contractDebtCeiling).to.equal(newDebtCeiling);
          });

          it("emits a SetBondDebtCeiling event", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondDebtCeiling(this.stubs.hToken.address, newDebtCeiling),
            )
              .to.emit(this.contracts.fintroller, "SetBondDebtCeiling")
              .withArgs(this.signers.admin.address, this.stubs.hToken.address, Zero, newDebtCeiling);
          });
        });
      });
    });
  });
}
