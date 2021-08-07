import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES, NORMALIZED_WBTC_PRICE } from "@hifi/constants";
import { bn, hUSDC } from "@hifi/helpers";
import { expect } from "chai";

import { getSeizableCollateralAmount } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetSeizableCollateralAmount(): void {
  context("when the liquidation incentive is 100%", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(LIQUIDATION_INCENTIVES.lowerBound);
    });

    it("returns zero", async function () {
      const repayAmount: BigNumber = hUSDC("15000");
      const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
        this.mocks.hTokens[0].address,
        repayAmount,
        this.mocks.wbtc.address,
      );
      expect(seizableCollateralAmount).to.equal(Zero);
    });
  });

  context("when the liquidation incentive is not 100%", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(LIQUIDATION_INCENTIVES.default);
    });

    context("when the repay amount is zero", function () {
      it("returns zero", async function () {
        const repayAmount: BigNumber = hUSDC("0");
        const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
          this.mocks.hTokens[0].address,
          repayAmount,
          this.mocks.wbtc.address,
        );
        expect(seizableCollateralAmount).to.equal(Zero);
      });
    });

    context("when the repay amount is not zero", function () {
      const repayAmount: BigNumber = hUSDC("15000");

      context("when the collateral has 18 decimals", function () {
        const collateralDecimals: BigNumber = bn("18");

        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
        });

        it("retrieves the correct value", async function () {
          const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
            this.mocks.hTokens[0].address,
            repayAmount,
            this.mocks.wbtc.address,
          );
          expect(seizableCollateralAmount).to.equal(
            getSeizableCollateralAmount(repayAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
          );
        });
      });

      context("when the collateral has 8 decimals", function () {
        const collateralDecimals: BigNumber = bn("8");

        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
        });

        it("retrieves the correct value", async function () {
          const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
            this.mocks.hTokens[0].address,
            repayAmount,
            this.mocks.wbtc.address,
          );
          expect(seizableCollateralAmount).to.equal(
            getSeizableCollateralAmount(repayAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
          );
        });
      });
    });
  });
}
