import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";
import { FintrollerConstants, TokenAmounts } from "../../../../helpers/constants";
import { Vault } from "../../../../@types";

export default function shouldBehaveLikeLockCollateral(): void {
  const depositCollateralAmount: BigNumber = TokenAmounts.Ten;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          /* Mock the required functions on the Fintroller and the collateral token stubs. */
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.yToken.address)
            .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.yToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, depositCollateralAmount)
            .returns(true);

          /* Deposit 10 WETH. */
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, depositCollateralAmount);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.brad)
              .lockCollateral(this.stubs.yToken.address, depositCollateralAmount);
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.stubs.yToken.address).returns(true);
              /* The balance sheet will ask the oracle what's the value of 9 WETH collateral. */
            });

            describe("when the caller is safely over-collateralized", async function () {
              beforeEach(async function () {
                const debt: BigNumber = TokenAmounts.OneHundred;
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  debt,
                );
              });

              it("it frees the collateral", async function () {
                const oldVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );
                const collateralAmount: BigNumber = TokenAmounts.One;
                await this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .freeCollateral(this.stubs.yToken.address, collateralAmount);
                const newVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );

                expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(TokenAmounts.One));
                expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.add(TokenAmounts.One));
              });

              it("emits a FreeCollateral event", async function () {
                const collateralAmount: BigNumber = TokenAmounts.One;
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.brad)
                    .freeCollateral(this.stubs.yToken.address, collateralAmount),
                )
                  .to.emit(this.contracts.balanceSheet, "FreeCollateral")
                  .withArgs(this.stubs.yToken.address, this.accounts.brad, collateralAmount);
              });
            });

            describe("when the caller is dangerously collateralized", function () {
              beforeEach(async function () {
                /* This is a 150% collateralization ratio. We deposited 10 ETH and the oracle assumes 1 ETH = $100. */
                const debt: BigNumber = TokenAmounts.One.mul(666);

                /* Cannot call the usual `setVaultDebt` since the yToken is stubbed. */
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  debt,
                );
              });

              it("reverts", async function () {
                const collateralAmount: BigNumber = TokenAmounts.One;
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.brad)
                    .freeCollateral(this.stubs.yToken.address, collateralAmount),
                ).to.be.revertedWith(GenericErrors.BelowCollateralizationRatio);
              });
            });
          });

          describe("when the caller does not have a debt", function () {
            it("it frees the collateral", async function () {
              const oldVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );
              await this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, depositCollateralAmount);
              const newVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );

              expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(depositCollateralAmount));
              expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.add(depositCollateralAmount));
            });
          });
        });

        describe("when the caller did not lock the collateral", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, depositCollateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralInsufficientLockedCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.brad)
              .freeCollateral(this.stubs.yToken.address, depositCollateralAmount),
          ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralInsufficientLockedCollateral);
        });
      });
    });

    describe("when the collateral amount to free is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, Zero),
        ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.brad)
          .freeCollateral(this.stubs.yToken.address, depositCollateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });
}
