import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../../utils/errors";
import { OneToken, TenTokens, OneHundredTokens } from "../../../../utils/constants";
import { Vault } from "../../../../@types";
import { stubGetBondThresholdCollateralizationRatio } from "../../../stubs";

export default function shouldBehaveLikeLockCollateral(): void {
  const fullDepositCollateralAmount: BigNumber = TenTokens;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          /* Mock the required functions on the Fintroller and the Collateral stubs. */
          await stubGetBondThresholdCollateralizationRatio.call(this, this.stubs.yToken.address);
          await this.stubs.fintroller.mock.getDepositCollateralAllowed
            .withArgs(this.stubs.yToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, fullDepositCollateralAmount)
            .returns(true);

          /* Deposit 10 WETH. */
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, fullDepositCollateralAmount);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.brad)
              .lockCollateral(this.stubs.yToken.address, fullDepositCollateralAmount);
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.getBorrowAllowed.withArgs(this.stubs.yToken.address).returns(true);
              /* The balance sheet will ask the oracle what's the value of 9 WETH collateral. */
            });

            describe("when the caller is safely over-collateralized", async function () {
              beforeEach(async function () {
                /* Cannot call the usual `setVaultDebt` since the yToken is stubbed. */
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  OneHundredTokens,
                );
              });

              it("it frees the collateral", async function () {
                const oldVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );
                await this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .freeCollateral(this.stubs.yToken.address, OneToken);
                const newVault: Vault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );

                expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(OneToken));
                expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.add(OneToken));
              });

              it("emits a FreeCollateral event", async function () {
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.brad)
                    .freeCollateral(this.stubs.yToken.address, OneToken),
                )
                  .to.emit(this.contracts.balanceSheet, "FreeCollateral")
                  .withArgs(this.stubs.yToken.address, this.accounts.brad, OneToken);
              });
            });

            describe("when the caller is dangerously collateralized", function () {
              beforeEach(async function () {
                /* This is precisely a 150% collateralization ratio. We deposited 10 ETH and the oracle assumes 1 ETH = $100. */
                const debtValue: BigNumber = OneToken.mul(666);

                /* Cannot call the usual `setVaultDebt` since the yToken is stubbed. */
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  debtValue,
                );
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.brad)
                    .freeCollateral(this.stubs.yToken.address, OneToken),
                ).to.be.revertedWith(BalanceSheetErrors.BelowThresholdCollateralizationRatio);
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
                .freeCollateral(this.stubs.yToken.address, fullDepositCollateralAmount);
              const newVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );

              expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(fullDepositCollateralAmount));
              expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.add(fullDepositCollateralAmount));
            });

            it("emits a FreeCollateral event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .freeCollateral(this.stubs.yToken.address, fullDepositCollateralAmount),
              )
                .to.emit(this.contracts.balanceSheet, "FreeCollateral")
                .withArgs(this.stubs.yToken.address, this.accounts.brad, fullDepositCollateralAmount);
            });
          });
        });

        describe("when the caller did not lock the collateral", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, fullDepositCollateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralInsufficientLockedCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.brad)
              .freeCollateral(this.stubs.yToken.address, fullDepositCollateralAmount),
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
          .freeCollateral(this.stubs.yToken.address, fullDepositCollateralAmount),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });
}
