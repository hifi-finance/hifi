import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES, NORMALIZED_WBTC_PRICE } from "@hifi/constants";
import { WBTC, bn } from "@hifi/helpers";
import { expect } from "chai";
import fp from "evm-fp";

import { getRepayAmount } from "../../../shared/mirrors";

export default function shouldBehaveLikeGetRepayAmount(): void {
  beforeEach(async function () {
    await this.mocks.fintroller.mock.getLiquidationIncentive
      .withArgs(this.mocks.wbtc.address)
      .returns(LIQUIDATION_INCENTIVES.default);
  });

  context("when the seizable collateral amount is zero", function () {
    it("returns zero", async function () {
      const seizableCollateralAmount: BigNumber = Zero;
      const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayAmount(
        this.mocks.wbtc.address,
        seizableCollateralAmount,
        this.mocks.hTokens[0].address,
      );
      expect(repayAmount).to.equal(Zero);
    });
  });

  context("when the seizable collateral amount is not zero", function () {
    context("when the collateral has 18 decimals", function () {
      const collateralDecimals: BigNumber = bn("18");
      const seizableCollateralAmount: BigNumber = fp("1", 18);

      beforeEach(async function () {
        await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
      });

      it("returns the correct amount", async function () {
        const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayAmount(
          this.mocks.wbtc.address,
          seizableCollateralAmount,
          this.mocks.hTokens[0].address,
        );
        expect(repayAmount).to.equal(
          getRepayAmount(seizableCollateralAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
        );
      });
    });

    context("when the collateral has 8 decimals", function () {
      const collateralDecimals: BigNumber = bn("8");
      const seizableCollateralAmount: BigNumber = WBTC("1");

      beforeEach(async function () {
        await this.mocks.wbtc.mock.decimals.returns(collateralDecimals);
      });

      it("returns the correct amount", async function () {
        const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayAmount(
          this.mocks.wbtc.address,
          seizableCollateralAmount,
          this.mocks.hTokens[0].address,
        );
        expect(repayAmount).to.equal(
          getRepayAmount(seizableCollateralAmount, NORMALIZED_WBTC_PRICE, collateralDecimals),
        );
      });
    });
  });
}
