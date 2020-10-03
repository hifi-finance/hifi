import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../../utils/errors";
import { OneHundredTokens, OneThousandPercentMantissa, TenTokens } from "../../../../utils/constants";

export default function shouldBehaveLikeGetHypotheticalCollateralizationRatio(): void {
  const lockedCollateralAmount: BigNumber = TenTokens;
  const debt: BigNumber = OneHundredTokens;

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the locked collateral is non-zero", function () {
      describe("when the debt is non-zero", function () {
        describe("when the collateral price from the oracle is non-zero", function () {
          describe("when the collateral price from the oracle is non-zero", function () {
            it("retrieves the hypothetical collateralization ratio mantissa", async function () {
              const hypotheticalCollateralizationRatioMantissa: BigNumber = await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                this.stubs.yToken.address,
                this.accounts.brad,
                lockedCollateralAmount,
                debt,
              );
              expect(hypotheticalCollateralizationRatioMantissa).to.equal(OneThousandPercentMantissa);
            });
          });

          describe("when the underlying price from the oracle is zero", function () {
            beforeEach(async function () {
              const underlyingSymbol = await this.stubs.underlying.symbol();
              const zeroUnderlyingPrice: BigNumber = Zero;
              await this.stubs.oracle.mock.price.withArgs(underlyingSymbol).returns(zeroUnderlyingPrice);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                  this.stubs.yToken.address,
                  this.accounts.brad,
                  lockedCollateralAmount,
                  debt,
                ),
              ).to.be.revertedWith(GenericErrors.UnderlyingPriceZero);
            });
          });
        });

        describe("when the collateral price from the oracle is zero", function () {
          beforeEach(async function () {
            const collateralSymbol = await this.stubs.collateral.symbol();
            const zeroCollateralPrice: BigNumber = Zero;
            await this.stubs.oracle.mock.price.withArgs(collateralSymbol).returns(zeroCollateralPrice);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                this.stubs.yToken.address,
                this.accounts.brad,
                lockedCollateralAmount,
                debt,
              ),
            ).to.be.revertedWith(GenericErrors.CollateralPriceZero);
          });
        });
      });

      describe("when the debt is zero", function () {
        it("reverts", async function () {
          const zeroDebt: BigNumber = Zero;
          await expect(
            this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
              this.stubs.yToken.address,
              this.accounts.brad,
              lockedCollateralAmount,
              zeroDebt,
            ),
          ).to.be.revertedWith(BalanceSheetErrors.GetHypotheticalCollateralizationRatioDebtZero);
        });
      });
    });

    describe("when the locked collateral is zero", function () {
      it("reverts", async function () {
        const zeroCollateralAmount: BigNumber = Zero;
        const hypotheticalCollateralizationRatioMantissa = await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
          this.stubs.yToken.address,
          this.accounts.brad,
          zeroCollateralAmount,
          debt,
        );
        expect(hypotheticalCollateralizationRatioMantissa).to.equal(Zero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.brad)
          .getHypotheticalCollateralizationRatio(
            this.stubs.yToken.address,
            this.accounts.brad,
            lockedCollateralAmount,
            debt,
          ),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });
}
