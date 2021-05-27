import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants, hTokenConstants, precisionScalars, tokenAmounts } from "../../../../helpers/constants";
import { ten, underlyingConstants } from "../../../../helpers/constants";
import { GenericErrors, RedemptionPoolErrors } from "../../../../helpers/errors";
import { getNow } from "../../../../helpers/time";

export default function shouldBehaveLikeRedeemHTokens(): void {
  const underlyingAmount: BigNumber = ten.pow(underlyingConstants.decimals).mul(100);
  const hTokenAmount: BigNumber = tokenAmounts.oneHundred;

  describe("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.hToken.mock.expirationTime.returns(hTokenConstants.expirationTime);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
      ).to.be.revertedWith(GenericErrors.BondNotMatured);
    });
  });

  describe("when the bond matured", function () {
    beforeEach(async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
      await this.stubs.hToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    describe("when the amount to redeemHTokens is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(Zero)).to.be.revertedWith(
          RedemptionPoolErrors.RedeemHTokensZero,
        );
      });
    });

    describe("when the amount to redeemHTokens is not zero", function () {
      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getRedeemHTokensAllowed
            .withArgs(this.stubs.hToken.address)
            .revertsWithReason(GenericErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
          ).to.be.revertedWith(GenericErrors.BondNotListed);
        });
      });

      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.hToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
        });

        describe("when the fintroller does not allow redeem hTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemHTokensAllowed.withArgs(this.stubs.hToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.RedeemHTokensNotAllowed);
          });
        });

        describe("when the fintroller allows redeem hTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemHTokensAllowed.withArgs(this.stubs.hToken.address).returns(true);
          });

          describe("when there is not enough liquidity", function () {
            it("reverts", async function () {
              await expect(
                this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
              ).to.be.revertedWith(RedemptionPoolErrors.RedeemHTokensInsufficientUnderlying);
            });
          });

          describe("when there is enough liquidity", function () {
            beforeEach(async function () {
              const totalUnderlyingSupply: BigNumber = tokenAmounts.oneMillion;
              await this.contracts.redemptionPool.__godMode_setTotalUnderlyingSupply(totalUnderlyingSupply);
            });

            describe("when the call to burn the hTokens does not succeed", function () {
              beforeEach(async function () {
                await this.stubs.hToken.mock.burn.withArgs(this.signers.maker.address, underlyingAmount).reverts();
              });

              it("reverts", async function () {
                await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount)).to
                  .be.reverted;
              });
            });

            describe("when the call to burn the hTokens succeeds", function () {
              beforeEach(async function () {
                await this.stubs.hToken.mock.burn.withArgs(this.signers.maker.address, hTokenAmount).returns();
              });

              describe("when the underlying has 8 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(BigNumber.from(8));
                  await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith8Decimals);
                });
                const normalizedUnderlyingAmount: BigNumber = ten.pow(8).mul(100);

                beforeEach(async function () {
                  await this.stubs.underlying.mock.transfer
                    .withArgs(this.signers.maker.address, normalizedUnderlyingAmount)
                    .returns(true);
                });

                it("redeems the underlying", async function () {
                  const oldUnderlyingTotalSupply: BigNumber =
                    await this.contracts.redemptionPool.totalUnderlyingSupply();
                  await this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount);
                  const newUnderlyingTotalSupply: BigNumber =
                    await this.contracts.redemptionPool.totalUnderlyingSupply();
                  expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(normalizedUnderlyingAmount));
                });
              });

              describe("when the underlying has 6 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(BigNumber.from(6));
                  await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith6Decimals);
                });

                beforeEach(async function () {
                  await this.stubs.underlying.mock.transfer
                    .withArgs(this.signers.maker.address, underlyingAmount)
                    .returns(true);
                });

                it("redeems the underlying", async function () {
                  const oldUnderlyingTotalSupply: BigNumber =
                    await this.contracts.redemptionPool.totalUnderlyingSupply();
                  await this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount);
                  const newUnderlyingTotalSupply: BigNumber =
                    await this.contracts.redemptionPool.totalUnderlyingSupply();
                  expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
                });

                it("emits a RedeemHTokens event", async function () {
                  await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount))
                    .to.emit(this.contracts.redemptionPool, "RedeemHTokens")
                    .withArgs(this.signers.maker.address, hTokenAmount, underlyingAmount);
                });
              });
            });
          });
        });
      });
    });
  });
}
