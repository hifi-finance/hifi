import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, tokenAmounts } from "../../../../helpers/constants";
import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";
import { Vault } from "../../../../types";

export default function shouldBehaveLikeLockCollateral(): void {
  const depositCollateralAmount: BigNumber = tokenAmounts.ten;

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .freeCollateral(this.stubs.fyToken.address, depositCollateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
    });

    describe("when the collateral amount to free is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.borrower).freeCollateral(this.stubs.fyToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralZero);
      });
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .freeCollateral(this.stubs.fyToken.address, depositCollateralAmount),
          ).to.be.revertedWith(BalanceSheetErrors.InsufficientLockedCollateral);
        });
      });

      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          // Mock the required functions on the Fintroller and the collateral token stubs.
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.fyToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.fyToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.signers.borrower.address, this.contracts.balanceSheet.address, depositCollateralAmount)
            .returns(true);

          // Deposit 10 WETH.
          await this.contracts.balanceSheet
            .connect(this.signers.borrower)
            .depositCollateral(this.stubs.fyToken.address, depositCollateralAmount);
        });

        describe("when the caller did not lock the collateral", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .freeCollateral(this.stubs.fyToken.address, depositCollateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.InsufficientLockedCollateral);
          });
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.borrower)
              .lockCollateral(this.stubs.fyToken.address, depositCollateralAmount);
          });

          describe("when the caller does not have a debt", function () {
            it("it frees the collateral", async function () {
              const oldVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.fyToken.address,
                this.signers.borrower.address,
              );
              const oldFreeCollateral: BigNumber = oldVault[1];
              const oldLockedCollateral: BigNumber = oldVault[2];

              await this.contracts.balanceSheet
                .connect(this.signers.borrower)
                .freeCollateral(this.stubs.fyToken.address, depositCollateralAmount);

              const newVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.fyToken.address,
                this.signers.borrower.address,
              );
              const newFreeCollateral: BigNumber = newVault[1];
              const newLockedCollateral: BigNumber = newVault[2];

              expect(oldFreeCollateral).to.equal(newFreeCollateral.sub(depositCollateralAmount));
              expect(oldLockedCollateral).to.equal(newLockedCollateral.add(depositCollateralAmount));
            });
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.stubs.fyToken.address).returns(true);
              // The balance sheet will ask the oracle what's the value of 9 WETH collateral.
            });

            describe("when the caller is dangerously collateralized", function () {
              beforeEach(async function () {
                // This is a 150% collateralization ratio. We deposited 10 WETH and the oracle assumes 1 WETH = $100.
                const debt: BigNumber = tokenAmounts.one.mul(666);

                // Cannot call the usual `setVaultDebt` since the fyToken is stubbed.
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.fyToken.address,
                  this.signers.borrower.address,
                  debt,
                );
              });

              it("reverts", async function () {
                const collateralAmount: BigNumber = tokenAmounts.one;
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.borrower)
                    .freeCollateral(this.stubs.fyToken.address, collateralAmount),
                ).to.be.revertedWith(GenericErrors.BelowCollateralizationRatio);
              });
            });

            describe("when the caller is safely over-collateralized", async function () {
              beforeEach(async function () {
                const debt: BigNumber = tokenAmounts.oneHundred;
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.fyToken.address,
                  this.signers.borrower.address,
                  debt,
                );
              });

              it("it frees the collateral", async function () {
                const oldVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.fyToken.address,
                  this.signers.borrower.address,
                );
                const oldFreeCollateral: BigNumber = oldVault[1];
                const oldLockedCollateral: BigNumber = oldVault[2];

                const collateralAmount: BigNumber = tokenAmounts.one;
                await this.contracts.balanceSheet
                  .connect(this.signers.borrower)
                  .freeCollateral(this.stubs.fyToken.address, collateralAmount);

                const newVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.fyToken.address,
                  this.signers.borrower.address,
                );
                const newFreeCollateral: BigNumber = newVault[1];
                const newLockedCollateral: BigNumber = newVault[2];

                expect(oldFreeCollateral).to.equal(newFreeCollateral.sub(tokenAmounts.one));
                expect(oldLockedCollateral).to.equal(newLockedCollateral.add(tokenAmounts.one));
              });

              it("emits a FreeCollateral event", async function () {
                const collateralAmount: BigNumber = tokenAmounts.one;
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.borrower)
                    .freeCollateral(this.stubs.fyToken.address, collateralAmount),
                )
                  .to.emit(this.contracts.balanceSheet, "FreeCollateral")
                  .withArgs(this.stubs.fyToken.address, this.signers.borrower.address, collateralAmount);
              });
            });
          });
        });
      });
    });
  });
}
