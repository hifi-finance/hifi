import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { USDC, bn, hUSDC, precisionScalarForDecimals } from "../../../../helpers/numbers";
import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeRedeemHTokens(): void {
  const underlyingAmount: BigNumber = USDC("100");
  const hTokenAmount: BigNumber = hUSDC("100");

  context("when the amount to redeemHTokens is zero", function () {
    it("reverts", async function () {
      await expect(this.contracts.hTokens[0].connect(this.signers.maker).redeem(Zero)).to.be.revertedWith(
        HTokenErrors.RedeemZero,
      );
    });
  });

  context("when the amount to redeemHTokens is not zero", function () {
    context("when there is not enough liquidity", function () {
      it("reverts", async function () {
        await expect(this.contracts.hTokens[0].connect(this.signers.maker).redeem(hTokenAmount)).to.be.revertedWith(
          HTokenErrors.RedeemInsufficientLiquidity,
        );
      });
    });

    context("when there is enough liquidity", function () {
      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_mint(this.signers.maker.address, hTokenAmount);
        const totalUnderlyingSupply: BigNumber = fp("1e7", 18);
        await this.contracts.hTokens[0].__godMode_setTotalUnderlyingSupply(totalUnderlyingSupply);
      });

      context("when the underlying has 18 decimals", function () {
        const localUnderlyingAmount: BigNumber = fp("100", 18);

        beforeEach(async function () {
          await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(bn("1"));
          await this.mocks.usdc.mock.transfer.withArgs(this.signers.maker.address, localUnderlyingAmount).returns(true);
        });

        it("makes the redemption", async function () {
          const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
          await this.contracts.hTokens[0].connect(this.signers.maker).redeem(hTokenAmount);
          const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
          expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(localUnderlyingAmount));
        });
      });

      context("when the underlying has 6 decimals", function () {
        beforeEach(async function () {
          await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(precisionScalarForDecimals(bn("6")));
          await this.mocks.usdc.mock.transfer.withArgs(this.signers.maker.address, underlyingAmount).returns(true);
        });

        it("makes the redemption", async function () {
          const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
          await this.contracts.hTokens[0].connect(this.signers.maker).redeem(hTokenAmount);
          const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
          expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
        });

        it("emits a Redeem event", async function () {
          await expect(this.contracts.hTokens[0].connect(this.signers.maker).redeem(hTokenAmount))
            .to.emit(this.contracts.hTokens[0], "Redeem")
            .withArgs(this.signers.maker.address, hTokenAmount, underlyingAmount);
        });
      });
    });
  });
}
