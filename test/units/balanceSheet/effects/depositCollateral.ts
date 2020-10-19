import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, FintrollerErrors, GenericErrors } from "../../../../helpers/errors";
import { FintrollerConstants, TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeDepositCollateral(): void {
  const collateralAmount: BigNumber = TokenAmounts.Ten;
  const zeroCollateralAmount: BigNumber = Zero;

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .depositCollateral(this.stubs.yToken.address, collateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.yToken.address);
    });

    describe("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.stubs.yToken.address, zeroCollateralAmount),
        ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralZero);
      });
    });

    describe("when the amount to deposit is not zero", function () {
      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.stubs.yToken.address, collateralAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });

      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.yToken.address)
            .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
        });

        describe("when the fintroller does not allow deposit collateral", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getDepositCollateralAllowed
              .withArgs(this.stubs.yToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .depositCollateral(this.stubs.yToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralNotAllowed);
          });
        });

        describe("when the fintroller allows deposit collateral", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getDepositCollateralAllowed
              .withArgs(this.stubs.yToken.address)
              .returns(true);
          });

          describe("when the call to transfer the collateral does not succeed", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.borrower, this.contracts.balanceSheet.address, collateralAmount)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.stubs.yToken.address, collateralAmount),
              ).to.be.reverted;
            });
          });

          describe("when the call to transfer the collateral succeeds", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.borrower, this.contracts.balanceSheet.address, collateralAmount)
                .returns(true);
            });

            it("makes the collateral deposit", async function () {
              const oldVault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.borrower,
              );
              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .depositCollateral(this.stubs.yToken.address, collateralAmount);
              const newVault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.borrower,
              );
              expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(collateralAmount));
            });

            it("emits a DepositCollateral event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.stubs.yToken.address, collateralAmount),
              )
                .to.emit(this.contracts.balanceSheet, "DepositCollateral")
                .withArgs(this.stubs.yToken.address, this.accounts.borrower, collateralAmount);
            });
          });
        });
      });
    });
  });
}
