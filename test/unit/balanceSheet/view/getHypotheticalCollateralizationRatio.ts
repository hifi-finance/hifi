import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { COLLATERAL_SYMBOL, UNDERLYING_SYMBOL } from "../../../../helpers/constants";
import { BalanceSheetErrors, ChainlinkOperatorErrors, GenericErrors } from "../../../../helpers/errors";
import { bn, tokenWithNDecimalsPrecisionScalar } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetHypotheticalCollateralizationRatio(): void {
  const hypotheticalCollateralizationRatio: BigNumber = fp("10.00");
  const lockedCollateral: BigNumber = fp("10");
  const debt: BigNumber = fp("100");

  context("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.borrower)
          .getHypotheticalCollateralizationRatio(
            this.stubs.hToken.address,
            this.signers.borrower.address,
            lockedCollateral,
            debt,
          ),
      ).to.be.revertedWith(GenericErrors.VaultNotOpen);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    context("when the locked collateral is zero", function () {
      it("reverts", async function () {
        const zeroCollateralAmount: BigNumber = Zero;
        const hypotheticalCollateralizationRatio =
          await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
            this.stubs.hToken.address,
            this.signers.borrower.address,
            zeroCollateralAmount,
            debt,
          );
        expect(hypotheticalCollateralizationRatio).to.equal(Zero);
      });
    });

    context("when the locked collateral is not zero", function () {
      context("when the debt is zero", function () {
        it("reverts", async function () {
          const zeroDebt: BigNumber = Zero;
          await expect(
            this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
              this.stubs.hToken.address,
              this.signers.borrower.address,
              lockedCollateral,
              zeroDebt,
            ),
          ).to.be.revertedWith(BalanceSheetErrors.GetHypotheticalCollateralizationRatioDebtZero);
        });
      });

      context("when the debt is not zero", function () {
        context("when the collateral price from the oracle is zero", function () {
          beforeEach(async function () {
            await this.stubs.oracle.mock.getAdjustedPrice
              .withArgs(COLLATERAL_SYMBOL)
              .revertsWithReason(ChainlinkOperatorErrors.PriceZero);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                this.stubs.hToken.address,
                this.signers.borrower.address,
                lockedCollateral,
                debt,
              ),
            ).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
          });
        });

        context("when the collateral price from the oracle is not zero", function () {
          context("when the underlying price from the oracle is zero", function () {
            beforeEach(async function () {
              await this.stubs.oracle.mock.getAdjustedPrice
                .withArgs(UNDERLYING_SYMBOL)
                .revertsWithReason(ChainlinkOperatorErrors.PriceZero);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                  this.stubs.hToken.address,
                  this.signers.borrower.address,
                  lockedCollateral,
                  debt,
                ),
              ).to.be.revertedWith(ChainlinkOperatorErrors.PriceZero);
            });
          });

          context("when the underlying price from the oracle is not zero", function () {
            context("when the collateral has 8 decimals", function () {
              beforeEach(async function () {
                await this.stubs.collateral.mock.decimals.returns(bn("8"));
                await this.stubs.hToken.mock.collateralPrecisionScalar.returns(tokenWithNDecimalsPrecisionScalar(8));
              });

              it("retrieves the hypothetical collateralization ratio", async function () {
                const denormalizedLockedCollateral = lockedCollateral.div(tokenWithNDecimalsPrecisionScalar(8));
                const contractHypotheticalCollateralizationRatio: BigNumber =
                  await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                    this.stubs.hToken.address,
                    this.signers.borrower.address,
                    denormalizedLockedCollateral,
                    debt,
                  );
                expect(contractHypotheticalCollateralizationRatio).to.equal(hypotheticalCollateralizationRatio);
              });
            });

            context("when the collateral has 18 decimals", function () {
              beforeEach(async function () {
                await this.stubs.collateral.mock.decimals.returns(bn("18"));
                await this.stubs.hToken.mock.collateralPrecisionScalar.returns(tokenWithNDecimalsPrecisionScalar(18));
              });

              it("retrieves the hypothetical collateralization ratio", async function () {
                const contractHypotheticalCollateralizationRatio: BigNumber =
                  await this.contracts.balanceSheet.getHypotheticalCollateralizationRatio(
                    this.stubs.hToken.address,
                    this.signers.borrower.address,
                    lockedCollateral,
                    debt,
                  );
                expect(contractHypotheticalCollateralizationRatio).to.equal(hypotheticalCollateralizationRatio);
              });
            });
          });
        });
      });
    });
  });
}
