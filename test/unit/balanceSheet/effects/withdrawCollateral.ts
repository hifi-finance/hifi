import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { WBTC_COLLATERALIZATION_RATIO, WETH_COLLATERALIZATION_RATIO } from "../../../../helpers/constants";
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
        ]);
        await this.contracts.balanceSheet.__godMode_setCollateralAmount(
          this.signers.borrower.address,
          this.mocks.wbtc.address,
          fullWithdrawAmount,
        );
      });

      context("when the caller made a borrow", function () {
        const borrowAmount: BigNumber = fp("15000");

        beforeEach(async function () {
          await this.contracts.balanceSheet.__godMode_setBondList(this.signers.borrower.address, [
            this.mocks.hTokens[0].address,
          ]);
          await this.contracts.balanceSheet.__godMode_setDebtAmount(
            this.signers.borrower.address,
            this.mocks.hTokens[0].address,
            borrowAmount,
          );
        });

        context("when the caller runs into a liquidity shortfall", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .withdrawCollateral(this.mocks.wbtc.address, fullWithdrawAmount),
            ).to.be.revertedWith(BalanceSheetErrors.LiquidityShortfall);
          });
        });

        context("when the caller does not run into a liquidity shortfall", function () {
          const smallWithdrawAmount = wbtc("0.01");

          beforeEach(async function () {
            await this.mocks.wbtc.mock.transfer
              .withArgs(this.signers.borrower.address, smallWithdrawAmount)
              .returns(true);
          });

          it("makes the withdrawal", async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.mocks.wbtc.address, smallWithdrawAmount);

            const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
              this.signers.borrower.address,
            );
            expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);

            const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
              this.signers.borrower.address,
              this.mocks.wbtc.address,
            );
            expect(collateralAmount).to.equal(fullWithdrawAmount.sub(smallWithdrawAmount));
          });
        });
      });

      context("when the caller did not make a borrow", function () {
        context("when the withdrawal is full", function () {
          beforeEach(async function () {
            await this.mocks.wbtc.mock.transfer
              .withArgs(this.signers.borrower.address, fullWithdrawAmount)
              .returns(true);
          });

          it("makes the withdrawal", async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .withdrawCollateral(this.mocks.wbtc.address, fullWithdrawAmount);

            const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
              this.signers.borrower.address,
            );
            expect(collateralList).to.be.empty;

            const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
              this.signers.borrower.address,
              this.mocks.wbtc.address,
            );
            expect(collateralAmount).to.equal(Zero);
          });
        });

        context("when the withdrawal is partial", function () {
          const partialWithdrawAmount = wbtc("0.75");

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

            const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
              this.signers.borrower.address,
              this.mocks.wbtc.address,
            );
            expect(collateralAmount).to.equal(fullWithdrawAmount.sub(partialWithdrawAmount));
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
  });
}
