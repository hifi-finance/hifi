import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS } from "@hifi/constants";
import { bn } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";

import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetCollateralRatio(): void {
  const newCollateralRatio: BigNumber = fp("1.75");
  const overflowCollateralRatio: BigNumber = COLLATERAL_RATIOS.upperBound.add(bn("1"));
  const underflowCollateralRatio: BigNumber = COLLATERAL_RATIOS.lowerBound.sub(bn("1"));

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setCollateralRatio(this.mocks.wbtc.address, newCollateralRatio),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the collateral is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralRatio(this.mocks.wbtc.address, newCollateralRatio),
        ).to.be.revertedWith(FintrollerErrors.CollateralNotListed);
      });
    });

    context("when the collateral is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
      });

      context("when the collateral ratio is not valid", function () {
        context("when the collateral ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller.connect(this.signers.admin).setCollateralRatio(this.mocks.wbtc.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.CollateralRatioUnderflow);
          });
        });

        context("when the collateral ratio is above the upper bound", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralRatio(this.mocks.wbtc.address, overflowCollateralRatio),
            ).to.be.revertedWith(FintrollerErrors.CollateralRatioOverflow);
          });
        });

        context("when the collateral ratio is below the lower bound", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setCollateralRatio(this.mocks.wbtc.address, underflowCollateralRatio),
            ).to.be.revertedWith(FintrollerErrors.CollateralRatioUnderflow);
          });
        });
      });

      context("when the collateral ratio is valid", function () {
        it("sets the new collateral ratio", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setCollateralRatio(this.mocks.wbtc.address, newCollateralRatio);
          const collateralRatio: BigNumber = await this.contracts.fintroller.getCollateralRatio(
            this.mocks.wbtc.address,
          );
          expect(collateralRatio).to.equal(newCollateralRatio);
        });

        it("emits a SetCollateralRatio event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setCollateralRatio(this.mocks.wbtc.address, newCollateralRatio),
          )
            .to.emit(this.contracts.fintroller, "SetCollateralRatio")
            .withArgs(
              this.signers.admin.address,
              this.mocks.wbtc.address,
              COLLATERAL_RATIOS.default,
              newCollateralRatio,
            );
        });
      });
    });
  });
}
