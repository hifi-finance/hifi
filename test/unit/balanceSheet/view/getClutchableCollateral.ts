import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import {
  TOKEN_WITH_18_DECIMALS_PRECISION_SCALAR,
  TOKEN_WITH_8_DECIMALS_PRECISION_SCALAR,
} from "../../../../helpers/constants";
import { BalanceSheetErrors } from "../../../../helpers/errors";
import { bn } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetClutchableCollateral(): void {
  // 0.5 = 50 (repay amount) * 1.1 (liquidation incentive) * 1.0 (underlying price) / 100 (collateral price)
  const clutchableCollateralAmount: BigNumber = fp("0.55");
  const repayAmount: BigNumber = fp("50");

  context("when the amount to repay is zero", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.getClutchableCollateral(this.stubs.hToken.address, Zero),
      ).to.be.revertedWith(BalanceSheetErrors.GetClutchableCollateralZero);
    });
  });

  context("when the amount to repay is not zero", function () {
    context("when the liquidation incentive is zero", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondLiquidationIncentive.withArgs(this.stubs.hToken.address).returns(Zero);
      });

      it("retrieves zero", async function () {
        const clutchableCollateralAmount: BigNumber = await this.contracts.balanceSheet.getClutchableCollateral(
          this.stubs.hToken.address,
          repayAmount,
        );
        expect(clutchableCollateralAmount).to.equal(Zero);
      });
    });

    context("when the liquidation incentive is not zero", function () {
      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondLiquidationIncentive
          .withArgs(this.stubs.hToken.address)
          .returns(fp("1.10"));
      });

      context("when the collateral has 18 decimals", function () {
        beforeEach(async function () {
          await this.stubs.collateral.mock.decimals.returns(bn("18"));
          await this.stubs.hToken.mock.collateralPrecisionScalar.returns(TOKEN_WITH_18_DECIMALS_PRECISION_SCALAR);
        });

        it("retrieves the clutchable collateral amount", async function () {
          const contractClutchableCollateralAmount: BigNumber =
            await this.contracts.balanceSheet.getClutchableCollateral(this.stubs.hToken.address, repayAmount);
          expect(contractClutchableCollateralAmount).to.equal(clutchableCollateralAmount);
        });
      });

      context("when the collateral has 8 decimals", function () {
        beforeEach(async function () {
          await this.stubs.collateral.mock.decimals.returns(bn("8"));
          await this.stubs.hToken.mock.collateralPrecisionScalar.returns(TOKEN_WITH_8_DECIMALS_PRECISION_SCALAR);
        });

        it("retrieves the denormalized clutchable collateral amount", async function () {
          const denormalizedClutchableCollateralAmount = clutchableCollateralAmount.div(
            TOKEN_WITH_8_DECIMALS_PRECISION_SCALAR,
          );

          const contractClutchableCollateralAmount: BigNumber =
            await this.contracts.balanceSheet.getClutchableCollateral(this.stubs.hToken.address, repayAmount);
          expect(contractClutchableCollateralAmount).to.equal(denormalizedClutchableCollateralAmount);
        });
      });
    });
  });
}
