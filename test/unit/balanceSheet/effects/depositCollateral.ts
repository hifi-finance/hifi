import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, tokenAmounts } from "../../../../helpers/constants";
import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeDepositCollateral(): void {
  const collateralAmount: BigNumber = tokenAmounts.ten;
  const zeroCollateralAmount: BigNumber = Zero;

  context("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .depositCollateral(this.stubs.hToken.address, collateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    context("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.stubs.hToken.address, zeroCollateralAmount),
        ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralZero);
      });
    });

    context("when the amount to deposit is not zero", function () {
      context("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.hToken.address)
            .revertsWithReason(GenericErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .depositCollateral(this.stubs.hToken.address, collateralAmount),
          ).to.be.revertedWith(GenericErrors.BondNotListed);
        });
      });

      context("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.hToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
        });

        context("when the fintroller does not allow deposit collateral", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getDepositCollateralAllowed
              .withArgs(this.stubs.hToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .depositCollateral(this.stubs.hToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralNotAllowed);
          });
        });

        context("when the fintroller allows deposit collateral", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getDepositCollateralAllowed
              .withArgs(this.stubs.hToken.address)
              .returns(true);
          });

          context("when the call to transfer the collateral does not succeed", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, collateralAmount)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.stubs.hToken.address, collateralAmount),
              ).to.be.reverted;
            });
          });

          context("when the call to transfer the collateral succeeds", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, collateralAmount)
                .returns(true);
            });

            it("makes the collateral deposit", async function () {
              const oldVault = await this.contracts.balanceSheet.getVault(
                this.stubs.hToken.address,
                this.signers.borrower.address,
              );
              const oldFreeCollateral: BigNumber = oldVault[1];
              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .depositCollateral(this.stubs.hToken.address, collateralAmount);
              const newVault = await this.contracts.balanceSheet.getVault(
                this.stubs.hToken.address,
                this.signers.borrower.address,
              );
              const newFreeCollateral: BigNumber = newVault[1];
              expect(oldFreeCollateral).to.equal(newFreeCollateral.sub(collateralAmount));
            });

            it("emits a DepositCollateral event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .depositCollateral(this.stubs.hToken.address, collateralAmount),
              )
                .to.emit(this.contracts.balanceSheet, "DepositCollateral")
                .withArgs(this.stubs.hToken.address, this.signers.borrower.address, collateralAmount);
            });
          });
        });
      });
    });
  });
}
