import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { hUSDC } from "@hifi/helpers";
import { expect } from "chai";

import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetDebtCeiling(): void {
  const newDebtCeiling: BigNumber = hUSDC("100");

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setDebtCeiling(this.mocks.hTokens[0].address, newDebtCeiling),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.mocks.hTokens[0].address, newDebtCeiling),
        ).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
      });

      context("when the debt ceiling is below the current debt", function () {
        beforeEach(async function () {
          await this.mocks.hTokens[0].mock.totalSupply.returns(hUSDC("1e7"));
        });

        it("reverts", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.mocks.hTokens[0].address, newDebtCeiling),
          ).to.be.revertedWith(FintrollerErrors.DebtCeilingUnderflow);
        });
      });

      context("when the debt ceiling is not below the current debt", function () {
        beforeEach(async function () {
          await this.mocks.hTokens[0].mock.totalSupply.returns(Zero);
        });

        it("sets the new debt ceiling", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setDebtCeiling(this.mocks.hTokens[0].address, newDebtCeiling);
          const contractDebtCeiling: BigNumber = await this.contracts.fintroller.getDebtCeiling(
            this.mocks.hTokens[0].address,
          );
          expect(contractDebtCeiling).to.equal(newDebtCeiling);
        });

        it("emits a SetDebtCeiling event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setDebtCeiling(this.mocks.hTokens[0].address, newDebtCeiling),
          )
            .to.emit(this.contracts.fintroller, "SetDebtCeiling")
            .withArgs(this.signers.admin.address, this.mocks.hTokens[0].address, Zero, newDebtCeiling);
        });
      });
    });
  });
}
