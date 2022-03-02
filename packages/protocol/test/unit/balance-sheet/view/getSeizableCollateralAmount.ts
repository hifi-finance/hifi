import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES, NORMALIZED_WBTC_PRICE } from "@hifi/constants";
import { hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import forEach from "mocha-each";

import { getSeizableCollateralAmount } from "../../../shared/mirrors";

export function shouldBehaveLikeGetSeizableCollateralAmount(): void {
  context("when the liquidation incentive is zero", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive.withArgs(this.mocks.wbtc.address).returns(Zero);
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

  context("when the liquidation incentive is not zero", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(LIQUIDATION_INCENTIVES.default);
    });

    context("when the repay amount is zero", function () {
      it("returns zero", async function () {
        const repayAmount: BigNumber = Zero;
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
      const testSets: number[] = [18, 8, 1];

      forEach(testSets).describe("when the collateral has %d decimals", function (decimals: number) {
        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(decimals);
        });

        it("returns the correct amount", async function () {
          const seizableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getSeizableCollateralAmount(
            this.mocks.hTokens[0].address,
            repayAmount,
            this.mocks.wbtc.address,
          );
          expect(seizableCollateralAmount).to.equal(
            getSeizableCollateralAmount(repayAmount, NORMALIZED_WBTC_PRICE, BigNumber.from(decimals)),
          );
        });
      });
    });
  });
}
