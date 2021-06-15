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
import { FintrollerErrors, GenericErrors, OwnableErrors } from "../../../shared/errors";

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
      ).to.be.revertedWith(OwnableErrors.NotOwner);
    });
  });

  context("when the caller is the owner", function () {
    context("when the collateral is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.owner)
            .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive),
        ).to.be.revertedWith(GenericErrors.CollateralNotListed);
      });
    });

    context("when the collateral is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.owner).listCollateral(this.mocks.wbtc.address);
      });

      context("when the liquidation incentive is not valid", function () {
        context("when the liquidation ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.owner)
                .setLiquidationIncentive(this.mocks.wbtc.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveLowerBound);
          });
        });

        context("when the liquidation incentive is higher than 150%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.owner)
                .setLiquidationIncentive(this.mocks.wbtc.address, overflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveUpperBound);
          });
        });

        context("when the liquidation incentive is lower than 100%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.owner)
                .setLiquidationIncentive(this.mocks.wbtc.address, underflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveLowerBound);
          });
        });
      });

      context("when the liquidation incentive is valid", function () {
        it("sets the new liquidation incentive", async function () {
          await this.contracts.fintroller
            .connect(this.signers.owner)
            .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive);
          const liquidationIncentive: BigNumber = await this.contracts.fintroller.getLiquidationIncentive(
            this.mocks.wbtc.address,
          );
          expect(liquidationIncentive).to.equal(newLiquidationIncentive);
        });

        it("emits a SetLiquidationIncentive event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.owner)
              .setLiquidationIncentive(this.mocks.wbtc.address, newLiquidationIncentive),
          )
            .to.emit(this.contracts.fintroller, "SetLiquidationIncentive")
            .withArgs(
              this.signers.owner.address,
              this.mocks.wbtc.address,
              DEFAULT_LIQUIDATION_INCENTIVE,
              newLiquidationIncentive,
            );
        });
      });
    });
  });
}
