import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";
import { TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetDebtCeiling(): void {
  const newDebtCeiling: BigNumber = TokenAmounts.OneHundred;

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setDebtCeiling(this.stubs.yToken.address, newDebtCeiling),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.stubs.yToken.address, newDebtCeiling),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
      });

      describe("when the debt ceiling is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.admin).setDebtCeiling(this.stubs.yToken.address, Zero),
          ).to.be.revertedWith(FintrollerErrors.SetDebtCeilingZero);
        });
      });

      describe("when the debt ceiling is not zero", function () {
        it("sets the new debt ceiling", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.stubs.yToken.address, newDebtCeiling);
          const contractDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(
            this.stubs.yToken.address,
          );
          expect(contractDebtCeiling).to.equal(newDebtCeiling);
        });

        it("emits a SetDebtCeiling event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.stubs.yToken.address, newDebtCeiling),
          )
            .to.emit(this.contracts.fintroller, "SetDebtCeiling")
            .withArgs(this.accounts.admin, this.stubs.yToken.address, Zero, newDebtCeiling);
        });
      });
    });
  });
}
