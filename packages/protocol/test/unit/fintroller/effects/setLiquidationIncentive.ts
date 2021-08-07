import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { bn } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";

import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetLiquidationIncentive(): void {
  const newLiquidationIncentive: BigNumber = fp("1.20");
  const overflowLiquidationIncentive: BigNumber = LIQUIDATION_INCENTIVES.upperBound.add(bn("1"));
  const underflowLiquidationIncentive: BigNumber = LIQUIDATION_INCENTIVES.lowerBound.sub(bn("1"));

  context("when the caller is not the owner", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive),
      ).to.be.revertedWith(OwnableUpgradeableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the collateral is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive),
        ).to.be.revertedWith(FintrollerErrors.CollateralNotListed);
      });
    });

    context("when the collateral is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
      });

      context("when the liquidation incentive is not valid", function () {
        context("when the liquidation ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setLiquidationIncentive(this.mocks.wbtc.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.LiquidationIncentiveUnderflow);
          });
        });

        context("when the liquidation incentive is above the upper bound", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setLiquidationIncentive(this.mocks.wbtc.address, overflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.LiquidationIncentiveOverflow);
          });
        });

        context("when the liquidation incentive is below the lower bound", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setLiquidationIncentive(this.mocks.wbtc.address, underflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.LiquidationIncentiveUnderflow);
          });
        });
      });

      context("when the liquidation incentive is valid", function () {
        it("sets the new liquidation incentive", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive);
          const liquidationIncentive: BigNumber = await this.contracts.fintroller.getLiquidationIncentive(
            this.mocks.wbtc.address,
          );
          expect(liquidationIncentive).to.equal(newLiquidationIncentive);
        });

        it("emits a SetLiquidationIncentive event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive),
          )
            .to.emit(this.contracts.fintroller, "SetLiquidationIncentive")
            .withArgs(
              this.signers.admin.address,
              this.mocks.wbtc.address,
              LIQUIDATION_INCENTIVES.default,
              newLiquidationIncentive,
            );
        });
      });
    });
  });
}
