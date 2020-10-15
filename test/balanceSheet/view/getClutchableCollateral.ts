import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../utils/errors";
import { Percentages, PrecisionScalarForTokenWithSixDecimals, TokenAmounts } from "../../../utils/constants";
import { contextForStubbedCollateralWithSixDecimals } from "../../../utils/mochaContexts";

export default function shouldBehaveLikeGetClutchableCollateral(): void {
  /* 0.5 = 50 (repay amount) * 1.1 (liquidation incentive) * 1.0 (underlying price) / 100 (collateral price) */
  const clutchableCollateralAmount: BigNumber = TokenAmounts.PointFiftyFive;
  const repayAmount: BigNumber = TokenAmounts.Fifty;

  describe("when the amount to repay is not zero", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Percentages.OneHundredAndTen);
    });

    describe("when the liquidation incentive is not zero", function () {
      describe("when the collateral has 18 decimals", function () {
        it("retrieves the clutchable collateral amount", async function () {
          const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
            this.stubs.yToken.address,
            repayAmount,
          );
          expect(contractClutchableCollateralAmount).to.equal(clutchableCollateralAmount);
        });
      });

      contextForStubbedCollateralWithSixDecimals("when the collateral has 6 decimals", function () {
        it("retrieves the downscaled clutchable collateral amount", async function () {
          const downscaledClutchableCollateralAmount = clutchableCollateralAmount.div(
            PrecisionScalarForTokenWithSixDecimals,
          );

          const contractClutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
            this.stubs.yToken.address,
            repayAmount,
          );
          expect(contractClutchableCollateralAmount).to.equal(downscaledClutchableCollateralAmount);
        });
      });
    });

    describe("when the liquidation incentive is zero", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Zero);
      });

      it("retrieves zero", async function () {
        const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
          this.stubs.yToken.address,
          repayAmount,
        );
        expect(clutchableCollateralAmount).to.equal(Zero);
      });
    });
  });

  describe("when the amount to repay is zero", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.getClutchableCollateral(this.stubs.yToken.address, Zero),
      ).to.be.revertedWith(BalanceSheetErrors.GetClutchableCollateralZero);
    });
  });
}
