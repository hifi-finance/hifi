import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, Zero } from "@ethersproject/constants";
import { expect } from "chai";
import forEach from "mocha-each";

import { WBTC_COLLATERALIZATION_RATIO, WETH_COLLATERALIZATION_RATIO } from "../../../../helpers/constants";
import { WBTC, WETH, hUSDC } from "../../../../helpers/numbers";
import { getHypotheticalAccountLiquidity } from "../../../shared/mirrors";

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
    const wbtcDepositAmount: BigNumber = WBTC("1");
    const wethDepositAmount: BigNumber = WETH("10");

    beforeEach(async function () {
      // Mock the necessary methods.
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
        wbtcDepositAmount,
      );
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.weth.address,
        wethDepositAmount,
      );
    });

    context("when no borrow was made", function () {
      const testSets = [
        [Zero, Zero], // No hypothetical collateral deposit or borrow.
        [WETH("5"), Zero], // Hypothetical collateral deposit, but no hypothetical borrow.
        [Zero, hUSDC("70000")], // No hypothetical collateral deposit, but a hypothetical borrow.
        [WETH("5"), hUSDC("70000")], // Both a hypothetical collateral deposit and a borrow.
      ];

      forEach(testSets).it(
        "takes (%e,%e) and returns the correct values",
        async function (collateralAmountModify: BigNumber, debtAmountModify: BigNumber) {
          let collateralModify: string;
          let chosenWethDepositAmount: BigNumber;
          if (collateralAmountModify.isZero()) {
            collateralModify = AddressZero;
            chosenWethDepositAmount = wethDepositAmount;
          } else {
            collateralModify = this.mocks.weth.address;
            chosenWethDepositAmount = collateralAmountModify;
          }

          let bondModify: string;
          let chosenDebtAmount: BigNumber;
          if (debtAmountModify.isZero()) {
            bondModify = AddressZero;
            chosenDebtAmount = Zero;
          } else {
            await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
              this.mocks.hTokens[1].address,
            ]);
            bondModify = this.mocks.hTokens[1].address;
            chosenDebtAmount = debtAmountModify;
          }

          const result = await this.contracts.balanceSheet.getHypotheticalAccountLiquidity(
            this.signers.borrower.address,
            collateralModify,
            collateralAmountModify,
            bondModify,
            debtAmountModify,
          );
          const expected = getHypotheticalAccountLiquidity(
            [wbtcDepositAmount, chosenWethDepositAmount],
            [chosenDebtAmount],
          );
          expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
          expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
        },
      );
    });

    context("when two borrows were made", function () {
      const debtAmounts: BigNumber[] = [hUSDC("15000"), hUSDC("20000")];

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
        [WETH("5"), Zero], // Hypothetical collateral deposit, but no hypothetical borrow.
        [Zero, hUSDC("70000")], // No hypothetical collateral deposit, but a hypothetical borrow.
        [WETH("5"), hUSDC("70000")], // Both a hypothetical collateral deposit and a borrow.
      ];

      forEach(testSets).it(
        "takes (%e,%e) and returns the correct values",
        async function (collateralAmountModify: BigNumber, debtAmountModify: BigNumber) {
          let collateralModify: string;
          let chosenWethDepositAmount: BigNumber;
          if (collateralAmountModify.isZero()) {
            collateralModify = AddressZero;
            chosenWethDepositAmount = wethDepositAmount;
          } else {
            collateralModify = this.mocks.weth.address;
            chosenWethDepositAmount = collateralAmountModify;
          }

          let bondModify: string;
          let chosenDebtAmount: BigNumber;
          if (debtAmountModify.isZero()) {
            bondModify = AddressZero;
            chosenDebtAmount = debtAmounts[1];
          } else {
            bondModify = this.mocks.hTokens[1].address;
            chosenDebtAmount = debtAmountModify;
          }

          const result = await this.contracts.balanceSheet.getHypotheticalAccountLiquidity(
            this.signers.borrower.address,
            collateralModify,
            collateralAmountModify,
            bondModify,
            debtAmountModify,
          );
          const expected = getHypotheticalAccountLiquidity(
            [wbtcDepositAmount, chosenWethDepositAmount],
            [debtAmounts[0], chosenDebtAmount],
          );

          expect(result.excessLiquidity).to.equal(expected.excessLiquidity);
          expect(result.shortfallLiquidity).to.equal(expected.shortfallLiquidity);
        },
      );
    });
  });
}
