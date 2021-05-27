import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO,
  FINTROLLER_DEFAULT_LIQUIDATION_INCENTIVE,
  FINTROLLER_LIQUIDATION_INCENTIVE_LOWER_BOUND,
  FINTROLLER_LIQUIDATION_INCENTIVE_UPPER_BOUND,
} from "../../../../helpers/constants";
import { AdminErrors, FintrollerErrors, GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetBondLiquidationIncentive(): void {
  const newLiquidationIncentive: BigNumber = fp("1.20");
  const overflowLiquidationIncentive: BigNumber = FINTROLLER_LIQUIDATION_INCENTIVE_UPPER_BOUND.add(One);
  const underflowLiquidationIncentive: BigNumber = FINTROLLER_LIQUIDATION_INCENTIVE_LOWER_BOUND.sub(One);

  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller
          .connect(this.signers.raider)
          .setBondLiquidationIncentive(this.stubs.hToken.address, newLiquidationIncentive),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    context("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setBondLiquidationIncentive(this.stubs.hToken.address, newLiquidationIncentive),
        ).to.be.revertedWith(GenericErrors.BondNotListed);
      });
    });

    context("when the bond is listed", function () {
      beforeEach(async function () {
        await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
      });

      context("when the liquidation incentive is not valid", function () {
        context("when the liquidation ratio is zero", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondLiquidationIncentive(this.stubs.hToken.address, Zero),
            ).to.be.revertedWith(FintrollerErrors.SetBondLiquidationIncentiveLowerBound);
          });
        });

        context("when the liquidation incentive is higher than 150%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondLiquidationIncentive(this.stubs.hToken.address, overflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.SetBondLiquidationIncentiveUpperBound);
          });
        });

        context("when the liquidation incentive is lower than 100%", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.fintroller
                .connect(this.signers.admin)
                .setBondLiquidationIncentive(this.stubs.hToken.address, underflowLiquidationIncentive),
            ).to.be.revertedWith(FintrollerErrors.SetBondLiquidationIncentiveLowerBound);
          });
        });
      });

      context("when the liquidation incentive is valid", function () {
        it("sets the new liquidation incentive", async function () {
          await this.contracts.fintroller
            .connect(this.signers.admin)
            .setBondLiquidationIncentive(this.stubs.hToken.address, newLiquidationIncentive);
          const liquidationIncentive: BigNumber = await this.contracts.fintroller.getBondLiquidationIncentive(
            this.stubs.hToken.address,
          );
          expect(liquidationIncentive).to.equal(newLiquidationIncentive);
        });

        it("emits a SetBondLiquidationIncentive event", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setBondLiquidationIncentive(this.stubs.hToken.address, newLiquidationIncentive),
          )
            .to.emit(this.contracts.fintroller, "SetBondLiquidationIncentive")
            .withArgs(
              this.signers.admin.address,
              this.stubs.hToken.address,
              FINTROLLER_DEFAULT_LIQUIDATION_INCENTIVE,
              newLiquidationIncentive,
            );
        });
      });
    });
  });
}
