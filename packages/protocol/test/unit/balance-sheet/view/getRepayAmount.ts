import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES, NORMALIZED_WBTC_PRICE } from "@hifi/constants";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

import { getRepayAmount } from "../../../shared/mirrors";

export function shouldBehaveLikeGetRepayAmount(): void {
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
    const testSets: number[] = [18, 8, 1];

    forEach(testSets).describe("when the collateral has %d decimals", function (decimals: number) {
      const seizableCollateralAmount: BigNumber = toBn("1", decimals);

      beforeEach(async function () {
        await this.mocks.wbtc.mock.decimals.returns(decimals);
      });

      it("returns the correct amount", async function () {
        const repayAmount: BigNumber = await this.contracts.balanceSheet.getRepayAmount(
          this.mocks.wbtc.address,
          seizableCollateralAmount,
          this.mocks.hTokens[0].address,
        );
        expect(repayAmount).to.equal(
          getRepayAmount(seizableCollateralAmount, NORMALIZED_WBTC_PRICE, BigNumber.from(decimals)),
        );
      });
    });
  });
}
