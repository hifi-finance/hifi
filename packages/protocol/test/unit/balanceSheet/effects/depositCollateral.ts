import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { WBTC } from "../../../../helpers/numbers";
import { BalanceSheetErrors } from "../../../shared/errors";

export default function shouldBehaveLikeDepositCollateral(): void {
  context("when the Fintroller does not allow collateral deposits", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getDepositCollateralAllowed.withArgs(this.mocks.wbtc.address).returns(false);
    });

    it("reverts", async function () {
      const depositAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .depositCollateral(this.mocks.wbtc.address, depositAmount),
      ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralNotAllowed);
    });
  });

  context("when the Fintroller allows collateral deposits", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getDepositCollateralAllowed.withArgs(this.mocks.wbtc.address).returns(true);
    });

    context("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        const depositAmount: BigNumber = Zero;
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.mocks.wbtc.address, depositAmount),
        ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralZero);
      });
    });

    context("when the amount to deposit is not zero", function () {
      const depositAmounts: BigNumber[] = [WBTC("1"), WBTC("0.5")];

      context("when it is the first collateral deposit of the user", function () {
        beforeEach(async function () {
          // Mock the necessary methods.
          await this.mocks.wbtc.mock.transferFrom
            .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, depositAmounts[0])
            .returns(true);
        });

        it("makes the collateral deposit", async function () {
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.mocks.wbtc.address, depositAmounts[0]);

          const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
            this.signers.borrower.address,
          );
          expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);

          const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
            this.signers.borrower.address,
            this.mocks.wbtc.address,
          );
          expect(collateralAmount).to.equal(depositAmounts[0]);
        });
      });

      context("when it is the second collateral deposit of the user", function () {
        beforeEach(async function () {
          // Mock the necessary methods.
          await this.mocks.wbtc.mock.transferFrom
            .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, depositAmounts[0])
            .returns(true);
          await this.mocks.wbtc.mock.transferFrom
            .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, depositAmounts[1])
            .returns(true);

          // Make the first collateral deposit.
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.mocks.wbtc.address, depositAmounts[0]);
        });

        it("makes the collateral deposit", async function () {
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.mocks.wbtc.address, depositAmounts[1]);

          const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(
            this.signers.borrower.address,
          );
          expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);

          const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
            this.signers.borrower.address,
            this.mocks.wbtc.address,
          );
          expect(collateralAmount).to.equal(depositAmounts[0].add(depositAmounts[1]));
        });

        it("emits a DepositCollateral event", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.mocks.wbtc.address, depositAmounts[1]),
          )
            .to.emit(this.contracts.balanceSheet, "DepositCollateral")
            .withArgs(this.signers.borrower.address, this.mocks.wbtc.address, depositAmounts[1]);
        });
      });
    });
  });
}
