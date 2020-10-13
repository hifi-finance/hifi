import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../utils/errors";
import { Percentages, TokenAmounts } from "../../../utils/constants";

export default function shouldBehaveLikeGetClutchableCollateral(): void {
  const repayAmount: BigNumber = TokenAmounts.Fifty;

  describe("when the amount to repay is not zero", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.liquidationIncentiveMantissa.returns(Percentages.OneHundredAndTen);
    });

    describe("when the liquidation incentive is not zero", function () {
      it("retrieves the clutchable collateral amount", async function () {
        const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
          this.stubs.yToken.address,
          repayAmount,
        );
        /* 0.5 = 50 (repay amount) * 1.1 (liquidation incentive) * 1.0 (underlying price) / 100 (collateral price) */
        expect(clutchableCollateralAmount).to.equal(TokenAmounts.PointFiftyFive);
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
