import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../utils/errors";
import { OneHundredTokens } from "../../../../utils/constants";

export default function shouldBehaveLikeSetDebtCeiling(): void {
  /* Equivalent to 175% */
  const newDebtCeiling: BigNumber = OneHundredTokens;

  describe("when the caller is the admin", function () {
    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.yToken.address);
      });

      describe("when the debt ceiling is non-zero", function () {
        it("sets the new debt ceiling", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.stubs.yToken.address, newDebtCeiling);
          const contractDebtCeiling: BigNumber = await this.contracts.fintroller.getBondDebtCeiling(this.stubs.yToken.address);
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

      describe("when the debt ceiling is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.admin).setDebtCeiling(this.stubs.yToken.address, Zero),
          ).to.be.revertedWith(FintrollerErrors.SetDebtCeilingZero);
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralizationRatio(this.stubs.yToken.address, newDebtCeiling),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.eve).setDebtCeiling(this.stubs.yToken.address, newDebtCeiling),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });
}
