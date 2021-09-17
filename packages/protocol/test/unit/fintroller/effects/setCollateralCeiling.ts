import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { WBTC } from "@hifi/helpers";
import { expect } from "chai";

import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetCollateralCeiling(): void {
  const newCollateralCeiling: BigNumber = WBTC("100");

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setCollateralCeiling(this.mocks.wbtc.address, newCollateralCeiling),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the collateral is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralCeiling(this.mocks.wbtc.address, newCollateralCeiling),
        ).to.be.revertedWith(FintrollerErrors.CollateralNotListed);
      });
    });

    context("when the collateral is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
      });

      it("sets the new collateral ceiling", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setCollateralCeiling(this.mocks.wbtc.address, newCollateralCeiling);
        const collateralCeiling: BigNumber = await this.contracts.fintroller.getCollateralCeiling(
          this.mocks.wbtc.address,
        );
        expect(collateralCeiling).to.equal(newCollateralCeiling);
      });

      it("emits a SetCollateralCeiling event", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralCeiling(this.mocks.wbtc.address, newCollateralCeiling),
        )
          .to.emit(this.contracts.fintroller, "SetCollateralCeiling")
          .withArgs(this.signers.admin.address, this.mocks.wbtc.address, Zero, newCollateralCeiling);
      });
    });
  });
}
