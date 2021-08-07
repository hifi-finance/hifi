import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  DEFAULT_LIQUIDATION_INCENTIVE,
  LIQUIDATION_INCENTIVE_LOWER_BOUND,
  LIQUIDATION_INCENTIVE_UPPER_BOUND,
} from "../../../../helpers/constants";
import { bn } from "../../../../helpers/numbers";
import { FintrollerErrors, OwnableUpgradeableErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSetLiquidationIncentive(): void {
  const newLiquidationIncentive: BigNumber = fp("1.20");
  const overflowLiquidationIncentive: BigNumber = LIQUIDATION_INCENTIVE_UPPER_BOUND.add(bn("1"));
  const underflowLiquidationIncentive: BigNumber = LIQUIDATION_INCENTIVE_LOWER_BOUND.sub(bn("1"));

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
              DEFAULT_LIQUIDATION_INCENTIVE,
              newLiquidationIncentive,
            );
        });
      });
    });
  });
}
