import { LIQUIDATION_INCENTIVES, NORMALIZED_WBTC_PRICE } from "@hifi/constants";
import { bn, hUSDC } from "@hifi/helpers";

import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { getRepayBondAmount } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetRepayBondAmount(): void {
  context("when the liquidation incentive is 100%", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(LIQUIDATION_INCENTIVES.lowerBound);
    });

    it("returns zero", async function () {
      const liquidationAmount: BigNumber = hUSDC("15000");
      const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayBondAmount(
        this.mocks.hTokens[0].address,
        liquidationAmount,
        this.mocks.wbtc.address,
      );
      expect(repayAmount).to.equal(Zero);
    });
  });

  context("when the liquidation incentive is not 100%", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getLiquidationIncentive
        .withArgs(this.mocks.wbtc.address)
        .returns(LIQUIDATION_INCENTIVES.default);
    });

    context("when the collateral liquidation amount is zero", function () {
      it("returns zero", async function () {
        const liquidationAmount: BigNumber = hUSDC("0");
        const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayBondAmount(
          this.mocks.hTokens[0].address,
          liquidationAmount,
          this.mocks.wbtc.address,
        );
        expect(repayAmount).to.equal(Zero);
      });
    });

    context("when the collateral liquidation amount is not zero", function () {
      const liquidationAmount: BigNumber = hUSDC("15000");

      context("when the collateral has 18 decimals", function () {
        const collateralDecimals: BigNumber = bn("18");

        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
        });

        it("retrieves the correct value", async function () {
          const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayBondAmount(
            this.mocks.hTokens[0].address,
            liquidationAmount,
            this.mocks.wbtc.address,
          );
          expect(repayAmount).to.equal(
            getRepayBondAmount(liquidationAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
          );
        });
      });

      context("when the collateral has 8 decimals", function () {
        const collateralDecimals: BigNumber = bn("8");

        beforeEach(async function () {
          await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
        });

        it("retrieves the correct value", async function () {
          const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayBondAmount(
            this.mocks.hTokens[0].address,
            liquidationAmount,
            this.mocks.wbtc.address,
          );
          expect(repayAmount).to.equal(
            getRepayBondAmount(liquidationAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
          );
        });
      });
    });
  });
}
