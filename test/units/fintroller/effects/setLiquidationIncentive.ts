import { BigNumber } from "@ethersproject/bignumber";
import { One, Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { AdminErrors, FintrollerErrors } from "../../../../helpers/errors";
import { FintrollerConstants, Percentages } from "../../../../helpers/constants";

export default function shouldBehaveLikeSetCollateralizationRatio(): void {
  const newLiquidationIncentiveMantissa: BigNumber = Percentages.OneHundredAndTen;
  const overflowLiquidationIncentiveMantissa: BigNumber = FintrollerConstants.LiquidationIncentiveUpperBoundMantissa.add(
    One,
  );
  const underflowLiquidationIncentiveMantissa: BigNumber = FintrollerConstants.LiquidationIncentiveLowerBoundMantissa.sub(
    One,
  );

  describe("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.fintroller.connect(this.signers.raider).setLiquidationIncentive(newLiquidationIncentiveMantissa),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  describe("when the caller is the admin", function () {
    describe("when the liquidation incentive is not valid", function () {
      describe("when the liquidation ratio is zero", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller.connect(this.signers.admin).setLiquidationIncentive(Zero),
          ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveLowerBound);
        });
      });

      describe("when the liquidation incentive is higher than 150%", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(overflowLiquidationIncentiveMantissa),
          ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveUpperBound);
        });
      });

      describe("when the liquidation incentive is lower than 100%", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.fintroller
              .connect(this.signers.admin)
              .setLiquidationIncentive(underflowLiquidationIncentiveMantissa),
          ).to.be.revertedWith(FintrollerErrors.SetLiquidationIncentiveLowerBound);
        });
      });
    });

    describe("when the liquidation incentive is valid", function () {
      it("sets the new liquidation incentive", async function () {
        await this.contracts.fintroller
          .connect(this.signers.admin)
          .setLiquidationIncentive(newLiquidationIncentiveMantissa);
        const liquidationIncentiveMantissa: BigNumber = await this.contracts.fintroller.liquidationIncentiveMantissa();
        expect(liquidationIncentiveMantissa).to.equal(newLiquidationIncentiveMantissa);
      });

      it("emits a SetLiquidationIncentive event", async function () {
        const defaultLiquidationIncentiveMantissa: BigNumber = Percentages.OneHundredAndTen;
        await expect(
          this.contracts.fintroller
            .connect(this.signers.admin)
            .setLiquidationIncentive(newLiquidationIncentiveMantissa),
        )
          .to.emit(this.contracts.fintroller, "SetLiquidationIncentive")
          .withArgs(this.accounts.admin, defaultLiquidationIncentiveMantissa, newLiquidationIncentiveMantissa);
      });
    });
  });
}
