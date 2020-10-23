import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";
import { Percentages, PrecisionScalarForTokenWithEightDecimals, TokenAmounts } from "../../../../helpers/constants";
import { contextForStubbedCollateralWithEightDecimals } from "../../../../helpers/mochaContexts";

export default function shouldBehaveLikeGetClutchableCollateral(): void {
  /* 0.5 = 50 (repay amount) * 1.1 (liquidation incentive) * 1.0 (underlying price) / 100 (collateral price) */
  const clutchableCollateralAmount: BigNumber = TokenAmounts.PointFiftyFive;
  const repayAmount: BigNumber = TokenAmounts.Fifty;

  describe("when the amount to repay is zero", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.getClutchableCollateral(this.stubs.fyToken.address, Zero),
      ).to.be.revertedWith(BalanceSheetErrors.GetClutchableCollateralZero);
    });
  });

  describe("when the amount to repay is not zero", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Percentages.OneHundredAndTen);
    });

    describe("when the liquidation incentive is zero", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Zero);
      });

      it("retrieves zero", async function () {
        const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
          this.stubs.fyToken.address,
          repayAmount,
        );
        expect(clutchableCollateralAmount).to.equal(Zero);
      });
    });

    describe("when the liquidation incentive is not zero", function () {
      describe("when the collateral has 18 decimals", function () {
        it("retrieves the clutchable collateral amount", async function () {
          const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
            this.stubs.fyToken.address,
            repayAmount,
          );
          expect(contractClutchableCollateralAmount).to.equal(clutchableCollateralAmount);
        });
      });

      contextForStubbedCollateralWithEightDecimals("when the collateral has 6 decimals", function () {
        it("retrieves the downscaled clutchable collateral amount", async function () {
          const downscaledClutchableCollateralAmount = clutchableCollateralAmount.div(
            PrecisionScalarForTokenWithEightDecimals,
          );

          const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
            this.stubs.fyToken.address,
            repayAmount,
          );
          expect(contractClutchableCollateralAmount).to.equal(downscaledClutchableCollateralAmount);
        });
      });
    });
  });
}
