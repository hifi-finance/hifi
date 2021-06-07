import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  DEFAULT_LIQUIDATION_INCENTIVE,
  NORMALIZED_USDC_PRICE,
  NORMALIZED_WBTC_PRICE,
} from "../../../../helpers/constants";
import { bn, precisionScalarForDecimals } from "../../../../helpers/numbers";
import { prbDiv, prbMul } from "../../../shared/mirrors";

function getSeizableCollateralAmount(repayAmount: BigNumber, collateralDecimals: BigNumber): BigNumber {
  const numerator: BigNumber = prbMul(prbMul(repayAmount, DEFAULT_LIQUIDATION_INCENTIVE), NORMALIZED_USDC_PRICE);
  const normalizedSeizableCollateralAmount: BigNumber = prbDiv(numerator, NORMALIZED_WBTC_PRICE);
  const precisionScalar: BigNumber = precisionScalarForDecimals(collateralDecimals);
  const seizableCollateralAmount: BigNumber = normalizedSeizableCollateralAmount.div(precisionScalar);
  return seizableCollateralAmount;
}

export default function shouldBehaveLikeGetSeizableCollateralAmount(): void {
  context("when the liquidation incentive is zero", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive.withArgs(this.mocks.wbtc.address).returns(Zero);
    });

    it("returns zero", async function () {
      const repayAmount: BigNumber = fp("5000");
      const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
        this.mocks.hTokens[0].address,
        repayAmount,
        this.mocks.wbtc.address,
      );
      expect(seizableCollateralAmount).to.equal(Zero);
    });
  });

  context("when the liquidation incentive is not zero", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(DEFAULT_LIQUIDATION_INCENTIVE);
    });

    context("when the repay amount is zero", function () {
      it("returns zero", async function () {
        const repayAmount: BigNumber = fp("0");
        const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
          this.mocks.hTokens[0].address,
          repayAmount,
          this.mocks.wbtc.address,
        );
        expect(seizableCollateralAmount).to.equal(Zero);
      });
    });

    context("when the repay amount is not zero", function () {
      const repayAmount: BigNumber = fp("10000");

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
          expect(seizableCollateralAmount).to.equal(getSeizableCollateralAmount(repayAmount, collateralDecimals));
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
          expect(seizableCollateralAmount).to.equal(getSeizableCollateralAmount(repayAmount, collateralDecimals));
        });
      });
    });
  });
}
