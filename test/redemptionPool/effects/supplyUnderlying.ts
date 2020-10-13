import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerErrors, GenericErrors, RedemptionPoolErrors } from "../../../utils/errors";
import { TokenAmounts, YTokenConstants } from "../../../utils/constants";
import { stubGetBondCollateralizationRatio } from "../../stubs";

/**
 * Write tests for the following scenarios:
 * - Erc20 `transferFrom` function fails
 * - yToken mint function fails
 */
export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = TokenAmounts.OneHundred;

  describe("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.yToken.mock.expirationTime.returns(YTokenConstants.DefaultExpirationTime);
    });

    describe("when the amount of underlying to supply is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await stubGetBondCollateralizationRatio.call(this, this.stubs.yToken.address);
        });

        describe("when the fintroller allows supply underlying", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
              .withArgs(this.stubs.yToken.address)
              .returns(true);
          });

          describe("when the call to mint the yTokens succeeds", function () {
            beforeEach(async function () {
              /* The Redemption Pool makes internal calls to these stubbed functions. */
              await this.stubs.yToken.mock.mint.withArgs(this.accounts.mark, underlyingAmount).returns(true);
              await this.stubs.underlying.mock.transferFrom
                .withArgs(this.accounts.mark, this.contracts.redemptionPool.address, underlyingAmount)
                .returns(true);
            });

            it("supplies the underlying", async function () {
              const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
              await this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount);
              const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
              expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
            });

            it("emits a SupplyUnderlying event", async function () {
              await expect(this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount))
                .to.emit(this.contracts.redemptionPool, "SupplyUnderlying")
                .withArgs(this.accounts.mark, underlyingAmount);
            });
          });

          describe("when the call to mint the yTokens does not succeed", function () {
            beforeEach(async function () {
              await this.stubs.yToken.mock.mint.withArgs(this.accounts.mark, underlyingAmount).returns(false);
            });

            it("reverts", async function () {
              await expect(this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount))
                .to.be.reverted;
            });
          });
        });

        describe("when the fintroller does not allow supply underlying", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
              .withArgs(this.stubs.yToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.SupplyUnderlyingNotAllowed);
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getSupplyUnderlyingAllowed
            .withArgs(this.stubs.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });
    });

    describe("when the amount of underlying to supply is zero", function () {
      it("reverts", async function () {
        const zeroUnderlyingAmount: BigNumber = Zero;
        await expect(
          this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(zeroUnderlyingAmount),
        ).to.be.revertedWith(RedemptionPoolErrors.SupplyUnderlyingZero);
      });
    });
  });

  describe("when the bond matured", function () {
    beforeEach(async function () {
      /* Set the expiration time to now minus one hour. */
      const nowMinusOneHour: BigNumber = BigNumber.from(Math.round(new Date().getTime() / 1000) - 3600);
      await this.stubs.yToken.mock.expirationTime.returns(nowMinusOneHour);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.redemptionPool.connect(this.signers.mark).supplyUnderlying(underlyingAmount),
      ).to.be.revertedWith(GenericErrors.BondMatured);
    });
  });
}
