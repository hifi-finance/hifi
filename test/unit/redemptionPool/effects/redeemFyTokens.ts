import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerErrors, GenericErrors, RedemptionPoolErrors } from "../../../../helpers/errors";
import { fintrollerConstants, fyTokenConstants, precisionScalars, tokenAmounts } from "../../../../helpers/constants";
import { getNow } from "../../../../helpers/time";

export default function shouldBehaveLikeRedeemFyTokens(): void {
  const underlyingAmount: BigNumber = tokenAmounts.oneHundred;
  const fyTokenAmount: BigNumber = tokenAmounts.oneHundred;

  describe("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.fyToken.mock.expirationTime.returns(fyTokenConstants.expirationTime);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount),
      ).to.be.revertedWith(GenericErrors.BondNotMatured);
    });
  });

  describe("when the bond matured", function () {
    beforeEach(async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
      await this.stubs.fyToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    describe("when the amount to redeemFyTokens is zero", function () {
      it("reverts", async function () {
        const zeroRedeemFyTokensAmount: BigNumber = Zero;
        await expect(
          this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(zeroRedeemFyTokensAmount),
        ).to.be.revertedWith(RedemptionPoolErrors.RedeemFyTokensZero);
      });
    });

    describe("when the amount to redeemFyTokens is not zero", function () {
      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getRedeemFyTokensAllowed
            .withArgs(this.stubs.fyToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });

      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.fyToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
        });

        describe("when the fintroller does not allow redeem fyTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemFyTokensAllowed
              .withArgs(this.stubs.fyToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.RedeemFyTokensNotAllowed);
          });
        });

        describe("when the fintroller allows redeem fyTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemFyTokensAllowed
              .withArgs(this.stubs.fyToken.address)
              .returns(true);
          });

          describe("when there is not enough liquidity", function () {
            it("reverts", async function () {
              await expect(
                this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount),
              ).to.be.revertedWith(RedemptionPoolErrors.RedeemFyTokensInsufficientUnderlying);
            });
          });

          describe("when there is enough liquidity", function () {
            beforeEach(async function () {
              const totalUnderlyingSupply: BigNumber = tokenAmounts.oneMillion;
              await this.contracts.redemptionPool.__godMode_setTotalUnderlyingSupply(totalUnderlyingSupply);
            });

            describe("when the call to burn the fyTokens does not succeed", function () {
              beforeEach(async function () {
                await this.stubs.fyToken.mock.burn.withArgs(this.accounts.maker, underlyingAmount).returns(false);
              });

              it("reverts", async function () {
                await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount))
                  .to.be.reverted;
              });
            });

            describe("when the call to burn the fyTokens succeeds", function () {
              beforeEach(async function () {
                await this.stubs.fyToken.mock.burn.withArgs(this.accounts.maker, fyTokenAmount).returns(true);
              });

              describe("when the underlying has 8 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(BigNumber.from(8));
                  await this.stubs.fyToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith8Decimals);
                });
                const downscaledUnderlyingAmount: BigNumber = underlyingAmount.div(precisionScalars.tokenWith8Decimals);

                beforeEach(async function () {
                  await this.stubs.underlying.mock.transfer
                    .withArgs(this.accounts.maker, downscaledUnderlyingAmount)
                    .returns(true);
                });

                it("redeems the underlying", async function () {
                  const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                  await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount);
                  const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                  expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(downscaledUnderlyingAmount));
                });
              });

              describe("when the underlying has 18 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(BigNumber.from(18));
                  await this.stubs.fyToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith18Decimals);
                });

                beforeEach(async function () {
                  await this.stubs.underlying.mock.transfer
                    .withArgs(this.accounts.maker, underlyingAmount)
                    .returns(true);
                });

                it("redeems the underlying", async function () {
                  const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                  await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount);
                  const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                  expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
                });

                it("emits a RedeemFyTokens event", async function () {
                  await expect(
                    this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount),
                  )
                    .to.emit(this.contracts.redemptionPool, "RedeemFyTokens")
                    .withArgs(this.accounts.maker, fyTokenAmount, underlyingAmount);
                });
              });
            });
          });
        });
      });
    });
  });
}
