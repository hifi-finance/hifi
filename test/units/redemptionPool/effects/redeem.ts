import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerErrors, RedemptionPoolErrors, YTokenErrors } from "../../../helpers/errors";
import { OneHundredTokens, OneMillionTokens, YTokenConstants } from "../../../helpers/constants";
import { stubGetBond } from "../../../helpers/stubs";

/**
 * Write tests for the following scenarios:
 * - Erc20 `transferFrom` function fails
 * - yToken `burn` function fails
 */
export default function shouldBehaveLikeRedeem(): void {
  const redeemAmount: BigNumber = OneHundredTokens;

  describe("when the bond matured", function () {
    beforeEach(async function () {
      /* Set the expiration time to now. */
      await this.stubs.yToken.mock.expirationTime.returns(Math.round(new Date().getTime() / 1000));
    });

    describe("when the amount to redeem is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await stubGetBond.call(this, this.stubs.yToken.address);
        });

        describe("when the fintroller allows redeem", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.redeemAllowed.withArgs(this.stubs.yToken.address).returns(true);
          });

          describe("when there is enough underlying liquidity", function () {
            beforeEach(async function () {
              const underlyingTotalSupply: BigNumber = OneMillionTokens;
              await this.contracts.redemptionPool.__godMode_setUnderlyingTotalSupply(underlyingTotalSupply);

              /* The Redemption Pool makes internal calls to these stubbed functions. */
              await this.stubs.yToken.mock.burn.withArgs(this.accounts.mark, redeemAmount).returns(true);
              await this.stubs.underlying.mock.transfer.withArgs(this.accounts.mark, redeemAmount).returns(true);
            });

            it("redeems the underlying asset", async function () {
              const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.underlyingTotalSupply();
              await this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount);
              const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.underlyingTotalSupply();
              expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(redeemAmount));
            });

            it("emits a Redeem event", async function () {
              await expect(this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount))
                .to.emit(this.contracts.redemptionPool, "Redeem")
                .withArgs(this.accounts.mark, redeemAmount);
            });
          });

          describe("when there is not enough underlying liquidity", function () {
            it("reverts", async function () {
              await expect(
                this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount),
              ).to.be.revertedWith(RedemptionPoolErrors.RedeemInsufficientUnderlying);
            });
          });
        });

        describe("when the fintroller does not allow redeem", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.redeemAllowed.withArgs(this.stubs.yToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount),
            ).to.be.revertedWith(RedemptionPoolErrors.RedeemNotAllowed);
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.redeemAllowed
            .withArgs(this.stubs.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });
    });

    describe("when the amount to redeem is zero", function () {
      it("reverts", async function () {
        const zeroRedeemAmount: BigNumber = Zero;
        await expect(
          this.contracts.redemptionPool.connect(this.signers.mark).redeem(zeroRedeemAmount),
        ).to.be.revertedWith(RedemptionPoolErrors.RedeemZero);
      });
    });
  });

  describe("when the bond did not mature", function () {
    beforeEach(async function () {
      await this.stubs.yToken.mock.expirationTime.returns(YTokenConstants.DefaultExpirationTime);
    });

    it("reverts", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.mark).redeem(redeemAmount)).to.be.revertedWith(
        YTokenErrors.BondNotMatured,
      );
    });
  });
}
