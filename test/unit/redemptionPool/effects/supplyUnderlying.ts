import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import {
  fintrollerConstants,
  hTokenConstants,
  precisionScalars,
  ten,
  tokenAmounts,
  underlyingConstants,
} from "../../../../helpers/constants";
import { GenericErrors, RedemptionPoolErrors } from "../../../../helpers/errors";
import { getNow } from "../../../../helpers/time";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = ten.pow(underlyingConstants.decimals).mul(100);
  const hTokenAmount: BigNumber = tokenAmounts.oneHundred;

  describe("when the bond matured", function () {
    beforeEach(async function () {
      const nowMinusOneHour: BigNumber = getNow().sub(3600);
      await this.stubs.hToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount),
      ).to.be.revertedWith(GenericErrors.BondMatured);
    });
  });

  describe("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.hToken.mock.expirationTime.returns(hTokenConstants.expirationTime);
    });

    describe("when the amount of underlying to supply is zero", function () {
      it("reverts", async function () {
        const zeroUnderlyingAmount: BigNumber = Zero;
        await expect(
          this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(zeroUnderlyingAmount),
        ).to.be.revertedWith(RedemptionPoolErrors.SupplyUnderlyingZero);
      });
    });

    describe("when the amount of underlying to supply is not zero", function () {
      describe("when the bond is not listed", function () {
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

      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBondCollateralizationRatio
            .withArgs(this.stubs.hToken.address)
            .returns(fintrollerConstants.defaultCollateralizationRatio);
        });

        describe("when the fintroller does not allow supply underlying", function () {
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

        describe("when the fintroller allows supply underlying", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
              .withArgs(this.stubs.hToken.address)
              .returns(true);
          });

          describe("when the call to mint the hTokens does not succeed", function () {
            beforeEach(async function () {
              await this.stubs.hToken.mock.mint.withArgs(this.signers.maker.address, underlyingAmount).reverts();
            });

            it("reverts", async function () {
              await expect(this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount))
                .to.be.reverted;
            });
          });

          describe("when the call to mint the hTokens succeeds", function () {
            beforeEach(async function () {
              await this.stubs.hToken.mock.mint.withArgs(this.signers.maker.address, hTokenAmount).returns();
            });

            describe("when the underlying has 8 decimals", function () {
              beforeEach(async function () {
                await this.stubs.underlying.mock.decimals.returns(BigNumber.from(8));
                await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith8Decimals);
              });

              const normalizedUnderlyingAmount: BigNumber = ten.pow(8).mul(100);

              beforeEach(async function () {
                await this.stubs.underlying.mock.transferFrom
                  .withArgs(
                    this.signers.maker.address,
                    this.contracts.redemptionPool.address,
                    normalizedUnderlyingAmount,
                  )
                  .returns(true);
              });

              it("supplies the underlying", async function () {
                const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                await this.contracts.redemptionPool
                  .connect(this.signers.maker)
                  .supplyUnderlying(normalizedUnderlyingAmount);
                const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
                expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(normalizedUnderlyingAmount));
              });
            });

            describe("when the underlying has 6 decimals", function () {
              beforeEach(async function () {
                await this.stubs.underlying.mock.decimals.returns(BigNumber.from(6));
                await this.stubs.hToken.mock.underlyingPrecisionScalar.returns(precisionScalars.tokenWith6Decimals);
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
