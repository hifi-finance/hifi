import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO, H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";
import { GenericErrors, RedemptionPoolErrors } from "../../../../helpers/errors";
import { bn, precisionScalarForDecimals, usdc } from "../../../../helpers/numbers";
import { now } from "../../../../helpers/time";

export default function shouldBehaveLikeRedeemHTokens(): void {
  const underlyingAmount: BigNumber = usdc("100");
  const hTokenAmount: BigNumber = fp("100");

  context("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.hToken.mock.expirationTime.returns(H_TOKEN_EXPIRATION_TIME);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
      ).to.be.revertedWith(GenericErrors.BondNotMatured);
    });
  });

  context("when the bond matured", function () {
    beforeEach(async function () {
      const nowMinusOneHour: BigNumber = now().sub(3600);
      await this.stubs.hToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    context("when the amount to redeemHTokens is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(Zero)).to.be.revertedWith(
          RedemptionPoolErrors.RedeemHTokensZero,
        );
      });
    });

    context("when the amount to redeemHTokens is not zero", function () {
      context("when the bond is not listed", function () {
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

      context("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.hToken.address)
            .returns(FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO);
        });

        context("when the fintroller does not allow redeem hTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemHTokensAllowed.withArgs(this.stubs.hToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.RedeemHTokensNotAllowed);
          });
        });

        context("when the fintroller allows redeem hTokens", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getRedeemHTokensAllowed.withArgs(this.stubs.hToken.address).returns(true);
          });

          context("when there is not enough liquidity", function () {
            it("reverts", async function () {
              await expect(
                this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
              ).to.be.revertedWith(RedemptionPoolErrors.RedeemHTokensInsufficientUnderlying);
            });
          });

          context("when there is enough liquidity", function () {
            beforeEach(async function () {
              const totalUnderlyingSupply: BigNumber = fp("1e7");
              await this.contracts.redemptionPool.__godMode_setTotalUnderlyingSupply(totalUnderlyingSupply);
            });

            context("when the call to burn the hTokens does not succeed", function () {
              beforeEach(async function () {
                await this.stubs.hToken.mock.burn.withArgs(this.signers.maker.address, underlyingAmount).reverts();
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount),
                ).to.be.reverted;
              });
            });

            context("when the call to burn the hTokens succeeds", function () {
              beforeEach(async function () {
                await this.stubs.hToken.mock.burn.withArgs(this.signers.maker.address, hTokenAmount).returns();
              });

              context("when the underlying has 8 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(bn("8"));
                  await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalarForDecimals(8));
                });
                const underlyingAmount: BigNumber = fp("100", 8);

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
              });

              context("when the underlying has 6 decimals", function () {
                beforeEach(async function () {
                  await this.stubs.underlying.mock.decimals.returns(bn("6"));
                  await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalarForDecimals(6));
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
