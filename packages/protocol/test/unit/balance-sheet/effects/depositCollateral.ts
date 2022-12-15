import type { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { BalanceSheetErrors } from "@hifi/errors";
import { WBTC } from "@hifi/helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";

export function shouldBehaveLikeDepositCollateral(): void {
  let borrower: SignerWithAddress;

  beforeEach(async function () {
    borrower = this.signers.borrower;
  });

  context("when the Fintroller does not allow collateral deposits", function () {
    beforeEach(async function () {
      await this.mocks.fintroller.mock.getDepositCollateralAllowed.withArgs(this.mocks.wbtc.address).returns(false);
    });

    it("reverts", async function () {
      const depositAmount: BigNumber = Zero;
      await expect(
        this.contracts.balanceSheet.connect(borrower).depositCollateral(this.mocks.wbtc.address, depositAmount),
      ).to.be.revertedWith(BalanceSheetErrors.DEPOSIT_COLLATERAL_NOT_ALLOWED);
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
          this.contracts.balanceSheet.connect(borrower).depositCollateral(this.mocks.wbtc.address, depositAmount),
        ).to.be.revertedWith(BalanceSheetErrors.DEPOSIT_COLLATERAL_ZERO);
      });
    });

    context("when the amount to deposit is not zero", function () {
      const depositAmounts: BigNumber[] = [WBTC("1"), WBTC("0.5")];

      beforeEach(async function () {
        await this.mocks.wbtc.mock.balanceOf.withArgs(this.contracts.balanceSheet.address).returns(Zero);
      });

      context("when the deposit overflows the collateral ceiling", function () {
        beforeEach(async function () {
          const collateralCeiling: BigNumber = depositAmounts[0].sub(1);
          await this.mocks.fintroller.mock.getCollateralCeiling
            .withArgs(this.mocks.wbtc.address)
            .returns(collateralCeiling);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet.connect(borrower).depositCollateral(this.mocks.wbtc.address, depositAmounts[0]),
          ).to.be.revertedWith(BalanceSheetErrors.COLLATERAL_CEILING_OVERFLOW);
        });
      });

      context("when the deposit does not overflow the collateral ceiling", function () {
        const collateralCeiling: BigNumber = WBTC("100");

        beforeEach(async function () {
          // Mock the necessary methods.
          await this.mocks.fintroller.mock.getCollateralCeiling
            .withArgs(this.mocks.wbtc.address)
            .returns(collateralCeiling);
          await this.mocks.wbtc.mock.transferFrom
            .withArgs(borrower.address, this.contracts.balanceSheet.address, depositAmounts[0])
            .returns(true);
          await this.mocks.fintroller.mock.maxCollaterals.returns(10);
        });

        context("when it is the first collateral deposit of the user", function () {
          it("makes the collateral deposit", async function () {
            await this.contracts.balanceSheet
              .connect(borrower)
              .depositCollateral(this.mocks.wbtc.address, depositAmounts[0]);

            const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(borrower.address);
            expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);

            const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
              borrower.address,
              this.mocks.wbtc.address,
            );
            expect(collateralAmount).to.equal(depositAmounts[0]);
          });
        });

        context("when it is the second collateral deposit of the user", function () {
          beforeEach(async function () {
            // Mock the necessary methods.
            await this.mocks.wbtc.mock.balanceOf
              .withArgs(this.contracts.balanceSheet.address)
              .returns(depositAmounts[1]);
            await this.mocks.wbtc.mock.transferFrom
              .withArgs(borrower.address, this.contracts.balanceSheet.address, depositAmounts[1])
              .returns(true);

            // Make the first collateral deposit.
            await this.contracts.balanceSheet
              .connect(borrower)
              .depositCollateral(this.mocks.wbtc.address, depositAmounts[0]);
          });

          it("makes the collateral deposit", async function () {
            await this.contracts.balanceSheet
              .connect(borrower)
              .depositCollateral(this.mocks.wbtc.address, depositAmounts[1]);

            const collateralList: string[] = await this.contracts.balanceSheet.getCollateralList(borrower.address);
            expect(collateralList).to.have.same.members([this.mocks.wbtc.address]);

            const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
              borrower.address,
              this.mocks.wbtc.address,
            );
            expect(collateralAmount).to.equal(depositAmounts[0].add(depositAmounts[1]));
          });

          it("emits a DepositCollateral event", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(borrower)
                .depositCollateral(this.mocks.wbtc.address, depositAmounts[1]),
            )
              .to.emit(this.contracts.balanceSheet, "DepositCollateral")
              .withArgs(borrower.address, this.mocks.wbtc.address, depositAmounts[1]);
          });
        });
      });
    });
  });
}
