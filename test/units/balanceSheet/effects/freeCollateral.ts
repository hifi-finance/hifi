import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import { waffle } from "@nomiclabs/buidler";

import { CarefulMathErrors, YTokenErrors } from "../../../helpers/errors";
import { FintrollerConstants, OneDollar, OneToken, TenTokens, OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.contracts.balanceSheet.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
          await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.stubs.yToken.address).returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, TenTokens)
            .returns(true);
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
              /* The yToken will ask the oracle what's the value of 9 WETH collateral. */
              await this.stubs.oracle.mock.multiplyCollateralAmountByItsPriceInUsd
                .withArgs(TenTokens.sub(OneToken))
                .returns(CarefulMathErrors.NoError, OneDollar.mul(900));
            });

            /* TODO: un-skip when Buidler releases `evm_impersonate` */
            describe.skip("when the caller is safely over-collateralized", async function () {
              it("it frees the collateral", async function () {
                const preVault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );
                await this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .freeCollateral(this.stubs.yToken.address, OneToken);
                const postVault = await this.contracts.balanceSheet.getVault(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                );
                expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(OneToken));
                expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(OneToken));
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

            /* TODO: unskip when Buidler releases `evm_impersonate` */
            describe.skip("when the caller is dangerously collateralized", function () {
              beforeEach(async function () {
                /* This is 150%. Recall that we deposited 10 ETH and that the oracle assumes 1 ETH = $100. */
                const borrowAmount: BigNumber = OneToken.mul(666);
                await this.stubs.oracle.mock.multiplyUnderlyingAmountByItsPriceInUsd
                  .withArgs(borrowAmount)
                  .returns(CarefulMathErrors.NoError, OneDollar.mul(666));
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.balanceSheet
                    .connect(this.signers.brad)
                    .freeCollateral(this.stubs.yToken.address, OneToken),
                ).to.be.revertedWith(YTokenErrors.BelowThresholdCollateralizationRatio);
              });
            });
          });

          describe("when the caller does not have a debt", function () {
            it("it frees the collateral", async function () {
              const preVault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );
              await this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, TenTokens);
              const postVault = await this.contracts.balanceSheet.getVault(
                this.stubs.yToken.address,
                this.accounts.brad,
              );
              expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(TenTokens));
              expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(TenTokens));
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

        describe("but did not lock it", function () {
          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .freeCollateral(this.stubs.yToken.address, TenTokens),
            ).to.be.revertedWith(YTokenErrors.FreeCollateralInsufficientLockedCollateral);
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, TenTokens),
          ).to.be.revertedWith(YTokenErrors.FreeCollateralInsufficientLockedCollateral);
        });
      });
    });

    describe("when the collateral amount to free is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, Zero),
        ).to.be.revertedWith(YTokenErrors.FreeCollateralZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.connect(this.signers.brad).freeCollateral(this.stubs.yToken.address, TenTokens),
      ).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
