import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { wbtc } from "../../../../helpers/numbers";
import { BalanceSheetErrors } from "../../../shared/errors";

export default function shouldBehaveLikeWithdrawCollateral(): void {
  context("when the amount to withdraw is zero", function () {
    it("reverts", async function () {
      const withdrawAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .withdrawCollateral(this.mocks.wbtc.address, withdrawAmount),
      ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralZero);
    });
  });

  context("when the amount to withdraw is not zero", function () {
    const fullWithdrawAmount: BigNumber = wbtc("1");

    context("when the caller did not deposit collateral", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .withdrawCollateral(this.mocks.wbtc.address, fullWithdrawAmount),
        ).to.be.revertedWith(BalanceSheetErrors.WithdrawCollateralUnderflow);
      });
    });

    context("when the caller deposited collateral", function () {
      beforeEach(async function () {
        await this.contracts.balanceSheet.__godMode_setCollateralList(this.signers.borrower.address, [
          this.mocks.wbtc.address,
        ]);
        await this.contracts.balanceSheet.__godMode_setCollateralAmount(
          this.signers.borrower.address,
          this.mocks.wbtc.address,
          fullWithdrawAmount,
        );
      });

      context("when the withdrawal is full", function () {
        beforeEach(async function () {
          await this.mocks.wbtc.mock.transfer.withArgs(this.signers.borrower.address, fullWithdrawAmount).returns(true);
        });

        it("makes the withdrawal", async function () {
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .withdrawCollateral(this.mocks.wbtc.address, fullWithdrawAmount);
          const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
            this.signers.borrower.address,
          );
          expect(collateralList).to.be.empty;
          // TODO: check the collateral amounts
        });
      });

      context("when the withdrawal is partial", function () {
        const partialWithdrawAmount = fullWithdrawAmount.div(2);

        beforeEach(async function () {
          await this.mocks.wbtc.mock.transfer
            .withArgs(this.signers.borrower.address, partialWithdrawAmount)
            .returns(true);
        });

        it("makes the withdrawal", async function () {
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .withdrawCollateral(this.mocks.wbtc.address, partialWithdrawAmount);
          const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
            this.signers.borrower.address,
          );
          expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);
          // TODO: check the collateral amounts
        });

        it("emits a WithdrawCollateral event", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.mocks.wbtc.address, partialWithdrawAmount),
          )
            .to.emit(this.contracts.balanceSheet, "WithdrawCollateral")
            .withArgs(this.signers.borrower.address, this.mocks.wbtc.address, partialWithdrawAmount);
        });
      });
    });
  });
}
