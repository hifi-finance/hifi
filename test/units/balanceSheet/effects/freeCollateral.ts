import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, CarefulMathErrors } from "../../../helpers/errors";
import { FintrollerConstants, OneDollar, OneHundredDollars, OneToken, TenTokens } from "../../../helpers/constants";
import { Vault } from "../../../../@types";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          /* Mock the required functions on the Fintroller and the Collateral stubs. */
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.stubs.yToken.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
          await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.stubs.yToken.address).returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, TenTokens)
            .returns(true);

          /* Deposit 10 WETH. */
          await this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, TenTokens);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.balanceSheet
              .connect(this.signers.brad)
              .lockCollateral(this.stubs.yToken.address, TenTokens);
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.stubs.yToken.address).returns(true);
              /* The balance sheet will ask the oracle what's the value of 9 WETH collateral. */
              await this.stubs.oracle.mock.multiplyCollateralAmountByItsPriceInUsd
                .withArgs(TenTokens.sub(OneToken))
                .returns(CarefulMathErrors.NoError, OneDollar.mul(900));
            });

            describe("when the caller is safely over-collateralized", async function () {
              beforeEach(async function () {
                /* Cannot call the usual `setVaultDebt` since the yToken is stubbed. */
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  OneHundredDollars,
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
                /* This is 150% collateralization ratio. We deposited 10 ETH and the oracle assumes 1 ETH = $100. */
                const borrowAmount: BigNumber = OneToken.mul(666);
                const borrowValueInUsd: BigNumber = OneDollar.mul(666);
                await this.stubs.oracle.mock.multiplyUnderlyingAmountByItsPriceInUsd
                  .withArgs(borrowAmount)
                  .returns(CarefulMathErrors.NoError, borrowValueInUsd);

                /* Cannot call the usual `setVaultDebt` since the yToken is stubbed. */
                await this.contracts.balanceSheet.__godMode_setVaultDebt(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  borrowValueInUsd,
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
                .freeCollateral(this.stubs.yToken.address, TenTokens);
              const newVault: Vault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );

              expect(oldVault.freeCollateral).to.equal(newVault.freeCollateral.sub(TenTokens));
              expect(oldVault.lockedCollateral).to.equal(newVault.lockedCollateral.add(TenTokens));
            });

            it("emits a FreeCollateral event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .freeCollateral(this.stubs.yToken.address, TenTokens),
              )
                .to.emit(this.contracts.balanceSheet, "FreeCollateral")
                .withArgs(this.stubs.yToken.address, this.accounts.brad, TenTokens);
            });
          });
        });

        describe("when the caller did not lock the collateral", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, TenTokens),
            ).to.be.revertedWith(BalanceSheetErrors.FreeCollateralInsufficientLockedCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, TenTokens),
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
        this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, TenTokens),
      ).to.be.revertedWith(BalanceSheetErrors.VaultNotOpen);
    });
  });
}
