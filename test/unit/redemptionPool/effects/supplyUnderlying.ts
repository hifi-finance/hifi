import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO, H_TOKEN_EXPIRATION_TIME } from "../../../../helpers/constants";
import { GenericErrors, RedemptionPoolErrors } from "../../../../helpers/errors";
import { bn, precisionScalarForDecimals, usdc } from "../../../../helpers/numbers";
import { now } from "../../../../helpers/time";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = usdc("100");
  const hTokenAmount: BigNumber = fp("100");

  context("when the bond matured", function () {
    beforeEach(async function () {
      const nowMinusOneHour: BigNumber = now().sub(3600);
      await this.stubs.hToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
      ).to.be.revertedWith(GenericErrors.BondMatured);
    });
  });

  context("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.hToken.mock.expirationTime.returns(H_TOKEN_EXPIRATION_TIME);
    });

    context("when the amount of underlying to supply is zero", function () {
      it("reverts", async function () {
        const zeroUnderlyingAmount: BigNumber = Zero;
        await expect(
          this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(zeroUnderlyingAmount),
        ).to.be.revertedWith(RedemptionPoolErrors.SupplyUnderlyingZero);
      });
    });

    context("when the amount of underlying to supply is not zero", function () {
      context("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
            .withArgs(this.stubs.hToken.address)
            .revertsWithReason(GenericErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
          ).to.be.revertedWith(GenericErrors.BondNotListed);
        });
      });

      context("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.hToken.address)
            .returns(FINTROLLER_DEFAULT_COLLATERALIZATION_RATIO);
        });

        context("when the fintroller does not allow supply underlying", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
              .withArgs(this.stubs.hToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.SupplyUnderlyingNotAllowed);
          });
        });

        context("when the fintroller allows supply underlying", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
              .withArgs(this.stubs.hToken.address)
              .returns(true);
          });

          context("when the call to mint the hTokens does not succeed", function () {
            beforeEach(async function () {
              await this.stubs.hToken.mock.mint.withArgs(this.signers.maker.address, underlyingAmount).reverts();
            });

            it("reverts", async function () {
              await expect(
                this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
              ).to.be.reverted;
            });
          });

          context("when the call to mint the hTokens succeeds", function () {
            beforeEach(async function () {
              await this.stubs.hToken.mock.mint.withArgs(this.signers.maker.address, hTokenAmount).returns();
            });

            context("when the underlying has 8 decimals", function () {
              beforeEach(async function () {
                await this.stubs.underlying.mock.decimals.returns(bn("8"));
                await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalarForDecimals(8));
              });

              const underlyingAmount: BigNumber = fp("100", 8);

              beforeEach(async function () {
                await this.stubs.underlying.mock.transferFrom
                  .withArgs(this.signers.maker.address, this.contracts.redemptionPool.address, underlyingAmount)
                  .returns(true);
              });

              it("supplies the underlying", async function () {
                const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);
                const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
              });
            });

            context("when the underlying has 6 decimals", function () {
              beforeEach(async function () {
                await this.stubs.underlying.mock.decimals.returns(bn("6"));
                await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalarForDecimals(6));
              });

              beforeEach(async function () {
                await this.stubs.underlying.mock.transferFrom
                  .withArgs(this.signers.maker.address, this.contracts.redemptionPool.address, underlyingAmount)
                  .returns(true);
              });

              it("supplies the underlying", async function () {
                const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);
                const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
              });

              it("emits a SupplyUnderlying event", async function () {
                await expect(
                  this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
                )
                  .to.emit(this.contracts.redemptionPool, "SupplyUnderlying")
                  .withArgs(this.signers.maker.address, underlyingAmount, hTokenAmount);
              });
            });
          });
        });
      });
    });
  });
}
