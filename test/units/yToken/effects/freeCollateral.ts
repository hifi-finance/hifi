import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { CarefulMathErrors, YTokenErrors } from "../../../helpers/errors";
import { FintrollerConstants, OneDollar, OneToken, TenTokens, OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the collateral amount to free is not zero", function () {
      describe("when the caller deposited collateral", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.contracts.yToken.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
          await this.stubs.fintroller.mock.depositCollateralAllowed
            .withArgs(this.contracts.yToken.address)
            .returns(true);
          await this.stubs.collateral.mock.transferFrom
            .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
            .returns(true);
          await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
        });

        describe("when the caller locked the collateral", function () {
          beforeEach(async function () {
            await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
          });

          describe("when the caller has a debt", function () {
            beforeEach(async function () {
              await this.stubs.fintroller.mock.borrowAllowed.withArgs(this.contracts.yToken.address).returns(true);
              /* The yToken will ask the oracle what's the value of 9 WETH collateral. */
              await this.stubs.oracle.mock.multiplyCollateralAmountByItsPriceInUsd
                .withArgs(TenTokens.sub(OneToken))
                .returns(CarefulMathErrors.NoError, OneDollar.mul(900));
            });

            describe("when the caller is safely over-collateralized", async function () {
              beforeEach(async function () {
                await this.contracts.yToken.connect(this.signers.brad).borrow(OneHundredTokens);
              });

              it("it frees the collateral", async function () {
                const preVault = await this.contracts.yToken.getVault(this.accounts.brad);
                await this.contracts.yToken.connect(this.signers.brad).freeCollateral(OneToken);
                const postVault = await this.contracts.yToken.getVault(this.accounts.brad);
                expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(OneToken));
                expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(OneToken));
              });

              it("emits a FreeCollateral event", async function () {
                await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(OneToken))
                  .to.emit(this.contracts.yToken, "FreeCollateral")
                  .withArgs(this.accounts.brad, OneToken);
              });
            });

            describe("when the caller is dangerously collateralized", function () {
              beforeEach(async function () {
                /* This is 150%. Recall that we deposited 10 ETH and that the oracle assumes 1 ETH = $100. */
                const borrowAmount: BigNumber = OneToken.mul(666);
                await this.stubs.oracle.mock.multiplyUnderlyingAmountByItsPriceInUsd
                  .withArgs(borrowAmount)
                  .returns(CarefulMathErrors.NoError, OneDollar.mul(666));
                await this.contracts.yToken.connect(this.signers.brad).borrow(borrowAmount);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.yToken.connect(this.signers.brad).freeCollateral(OneToken),
                ).to.be.revertedWith(YTokenErrors.BelowThresholdCollateralizationRatio);
              });
            });
          });

          describe("when the caller does not have a debt", function () {
            it("it frees the collateral", async function () {
              const preVault = await this.contracts.yToken.getVault(this.accounts.brad);
              await this.contracts.yToken.connect(this.signers.brad).freeCollateral(TenTokens);
              const postVault = await this.contracts.yToken.getVault(this.accounts.brad);
              expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(TenTokens));
              expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(TenTokens));
            });

            it("emits a FreeCollateral event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(TenTokens))
                .to.emit(this.contracts.yToken, "FreeCollateral")
                .withArgs(this.accounts.brad, TenTokens);
            });
          });
        });

        describe("but did not lock it", function () {
          it("reverts", async function () {
            await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(TenTokens)).to.be.revertedWith(
              YTokenErrors.FreeCollateralInsufficientLockedCollateral,
            );
          });
        });
      });

      describe("when the caller did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(TenTokens)).to.be.revertedWith(
            YTokenErrors.FreeCollateralInsufficientLockedCollateral,
          );
        });
      });
    });

    describe("when the collateral amount to free is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.FreeCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).freeCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
