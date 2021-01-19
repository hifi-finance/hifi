import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, ChainlinkOperatorErrors, GenericErrors } from "../../../../helpers/errors";
import { percentages, precisionScalars, tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetHypotheticalCollateralizationRatio(): void {
  const hypotheticalCollateralizationRatioMantissa: BigNumber = percentages.oneThousand;
  const lockedCollateral: BigNumber = tokenAmounts.ten;
  const debt: BigNumber = tokenAmounts.oneHundred;

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .getHypotheticalCollateralizationRatio(
            this.stubs.fyToken.address,
            this.accounts.borrower,
            lockedCollateral,
            debt,
          ),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  describe("when the vault is not open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
    });

    describe("when the locked collateral is zero", function () {
      it("reverts", async function () {
        const zeroCollateralAmount: BigNumber = Zero;
        const hypotheticalCollateralizationRatioMantissa = await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
          this.stubs.fyToken.address,
          this.accounts.borrower,
          zeroCollateralAmount,
          debt,
        );
        expect(hypotheticalCollateralizationRatioMantissa).to.equal(Zero);
      });
    });

    describe("when the locked collateral is not zero", function () {
      describe("when the debt is zero", function () {
        it("reverts", async function () {
          const zeroDebt: BigNumber = Zero;
          await expect(
            this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
              this.stubs.fyToken.address,
              this.accounts.borrower,
              lockedCollateral,
              zeroDebt,
            ),
          ).to.be.revertedWith(BalanceSheetErrors.GetHypotheticalCollateralizationRatioDebtZero);
        });
      });

      describe("when the debt is not zero", function () {
        describe("when the collateral price from the oracle is zero", function () {
          beforeEach(async function () {
            await this.stubs.oracle.mock.getAdjustedPrice
              .withArgs("WETH")
              .revertsWithReason(ChainlinkOperatorErrors.PriceZero);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                this.stubs.fyToken.address,
                this.accounts.borrower,
                lockedCollateral,
                debt,
              ),
            ).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
          });
        });

        describe("when the collateral price from the oracle is not zero", function () {
          describe("when the underlying price from the oracle is zero", function () {
            beforeEach(async function () {
              await this.stubs.oracle.mock.getAdjustedPrice
                .withArgs("DAI")
                .revertsWithReason(ChainlinkOperatorErrors.PriceZero);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                  this.stubs.fyToken.address,
                  this.accounts.borrower,
                  lockedCollateral,
                  debt,
                ),
              ).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
            });
          });

          describe("when the underlying price from the oracle is not zero", function () {
            describe("when the collateral has 8 decimals", function () {
              beforeEach(async function () {
                await this.stubs.collateral.mock.decimals.returns(BigNumber.from(8));
                await this.stubs.fyToken.mock.collateralPrecisionScalar.returns(precisionScalars.tokenWith8Decimals);
              });

              it("retrieves the hypothetical collateralization ratio mantissa", async function () {
                const downscaledLockedCollateral = lockedCollateral.div(precisionScalars.tokenWith8Decimals);
                const contractHypotheticalCollateralizationRatioMantissa: BigNumber = await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                  this.stubs.fyToken.address,
                  this.accounts.borrower,
                  downscaledLockedCollateral,
                  debt,
                );
                expect(contractHypotheticalCollateralizationRatioMantissa).to.equal(
                  hypotheticalCollateralizationRatioMantissa,
                );
              });
            });

            describe("when the collateral has 18 decimals", function () {
              beforeEach(async function () {
                await this.stubs.collateral.mock.decimals.returns(BigNumber.from(18));
                await this.stubs.fyToken.mock.collateralPrecisionScalar.returns(precisionScalars.tokenWith18Decimals);
              });

              it("retrieves the hypothetical collateralization ratio mantissa", async function () {
                const contractHypotheticalCollateralizationRatioMantissa: BigNumber = await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                  this.stubs.fyToken.address,
                  this.accounts.borrower,
                  lockedCollateral,
                  debt,
                );
                expect(contractHypotheticalCollateralizationRatioMantissa).to.equal(
                  hypotheticalCollateralizationRatioMantissa,
                );
              });
            });
          });
        });
      });
    });
  });
}
