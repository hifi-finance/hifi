import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { WBTC_COLLATERALIZATION_RATIO, WETH_COLLATERALIZATION_RATIO } from "../../../../helpers/constants";
import { weighWbtc, weighWeth } from "../../../../helpers/math";
import { wbtc, weth } from "../../../../helpers/numbers";

const wbtcAmount: BigNumber = wbtc("1");

export function getHypotheticalAccountLiquidity(
  collateralAmounts: BigNumber[],
  debtAmounts: BigNumber[],
): { excessLiquidity: BigNumber; shortfallLiquidity: BigNumber } {
  // Sum up the weighted collateral values in USD.
  let totalWeightedCollateralValueUsd: BigNumber = Zero;
  totalWeightedCollateralValueUsd = totalWeightedCollateralValueUsd.add(weighWbtc(collateralAmounts[0]));
  totalWeightedCollateralValueUsd = totalWeightedCollateralValueUsd.add(weighWeth(collateralAmounts[1]));

  // Sum up all debts. It is assumed that the underlying is USDC and its price is $1.
  let totalDebtValueUsd: BigNumber = Zero;
  for (const debtAmount of debtAmounts) {
    totalDebtValueUsd = totalDebtValueUsd.add(debtAmount);
  }

  // Excess liquidity when there is more weighted collateral than debt, and shortfall liquidity when there is less
  // weighted collateral than debt.
  if (totalWeightedCollateralValueUsd.gt(totalDebtValueUsd)) {
    return {
      excessLiquidity: totalWeightedCollateralValueUsd.sub(totalDebtValueUsd),
      shortfallLiquidity: Zero,
    };
  } else {
    return {
      excessLiquidity: Zero,
      shortfallLiquidity: totalDebtValueUsd.sub(totalWeightedCollateralValueUsd),
    };
  }
}

export default function shouldBehaveLikeGetHypotheticalAccountLiquidity(): void {
  context("when no deposit was made", function () {
    it("returns (0,0)", async function () {
      const collateralModify: string = AddressZero;
      const collateralAmountModify: BigNumber = Zero;
      const bondModify: string = AddressZero;
      const debtAmountModify: BigNumber = Zero;

      const result = await this.contracts.balanceSheet.getHypotheticalAccountLiquidity(
        this.signers.borrower.address,
        collateralModify,
        collateralAmountModify,
        bondModify,
        debtAmountModify,
      );
      expect(result.excessLiquidity).to.equal(Zero);
      expect(result.shortfallLiquidity).to.equal(Zero);
    });
  });

  context("when two deposits were made", function () {
    const wethAmount: BigNumber = weth("10");

    beforeEach(async function () {
      // Mocks the necessary methods.
      await this.mocks.fintroller.mock.getCollateralizationRatio
        .withArgs(this.mocks.wbtc.address)
        .returns(WBTC_COLLATERALIZATION_RATIO);
      await this.mocks.fintroller.mock.getCollateralizationRatio
        .withArgs(this.mocks.weth.address)
        .returns(WETH_COLLATERALIZATION_RATIO);

      // Make the collateral deposits.
      await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
        this.mocks.wbtc.address,
        this.mocks.weth.address,
      ]);
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.wbtc.address,
        wbtcAmount,
      );
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.weth.address,
        wethAmount,
      );
    });

    context("when no borrow was made", function () {
      const testSets = [
        [Zero, Zero], // No hypothetical collateral deposit or borrow.
        [weth("5"), Zero], // Hypothetical collateral deposit, but no hypothetical borrow.
        [Zero, fp("70000")], // No hypothetical collateral deposit, but a hypothetical borrow.
        [weth("5"), fp("70000")], // Both a hypothetical collateral deposit and a borrow.
      ];

      forEach(testSets).it(
        "takes (%e,%e) and returns the correct values",
        async function (collateralAmountModify: BigNumber, debtAmountModify: BigNumber) {
          let collateralModify: string;
          let localWethAmount: BigNumber;
          if (collateralAmountModify.isZero()) {
            collateralModify = AddressZero;
            localWethAmount = wethAmount;
          } else {
            collateralModify = this.mocks.weth.address;
            localWethAmount = collateralAmountModify;
          }

          let bondModify: string;
          let debtAmount: BigNumber;
          if (debtAmountModify.isZero()) {
            bondModify = AddressZero;
            debtAmount = Zero;
          } else {
            await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
              this.mocks.hTokens[1].address,
            ]);
            bondModify = this.mocks.hTokens[1].address;
            debtAmount = debtAmountModify;
          }

          const result = await this.contracts.balanceSheet.getHypotheticalAccountLiquidity(
            this.signers.borrower.address,
            collateralModify,
            collateralAmountModify,
            bondModify,
            debtAmountModify,
          );
          const expected = getHypotheticalAccountLiquidity([wbtcAmount, localWethAmount], [debtAmount]);
          expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
          expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
        },
      );
    });

    context("when two borrows were made", function () {
      const debtAmounts: BigNumber[] = [fp("15000"), fp("20000")];

      beforeEach(async function () {
        await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
          this.mocks.hTokens[0].address,
          this.mocks.hTokens[1].address,
        ]);
        await this.contracts.balanceSheet.__godMode_setDebtAmount(
          this.signers.borrower.address,
          this.mocks.hTokens[0].address,
          debtAmounts[0],
        );
        await this.contracts.balanceSheet.__godMode_setDebtAmount(
          this.signers.borrower.address,
          this.mocks.hTokens[1].address,
          debtAmounts[1],
        );
      });

      const testSets = [
        [Zero, Zero], // No hypothetical collateral deposit or borrow.
        [weth("5"), Zero], // Hypothetical collateral deposit, but no hypothetical borrow.
        [Zero, fp("70000")], // No hypothetical collateral deposit, but a hypothetical borrow.
        [weth("5"), fp("70000")], // Both a hypothetical collateral deposit and a borrow.
      ];

      forEach(testSets).it(
        "takes (%e,%e) and returns the correct values",
        async function (collateralAmountModify: BigNumber, debtAmountModify: BigNumber) {
          let collateralModify: string;
          let localWethAmount: BigNumber;
          if (collateralAmountModify.isZero()) {
            collateralModify = AddressZero;
            localWethAmount = wethAmount;
          } else {
            collateralModify = this.mocks.weth.address;
            localWethAmount = collateralAmountModify;
          }

          let bondModify: string;
          let localDebtAmount: BigNumber;
          if (debtAmountModify.isZero()) {
            bondModify = AddressZero;
            localDebtAmount = debtAmounts[1];
          } else {
            bondModify = this.mocks.hTokens[1].address;
            localDebtAmount = debtAmountModify;
          }

          const result = await this.contracts.balanceSheet.getHypotheticalAccountLiquidity(
            this.signers.borrower.address,
            collateralModify,
            collateralAmountModify,
            bondModify,
            debtAmountModify,
          );
          const expected = getHypotheticalAccountLiquidity(
            [wbtcAmount, localWethAmount],
            [debtAmounts[0], localDebtAmount],
          );

          expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
          expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
        },
      );
    });
  });
}
