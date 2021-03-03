import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { fyTokenConstants } from "../../../../helpers/constants";
import { ten, tokenAmounts, underlyingConstants } from "../../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../contexts";
import { increaseTime } from "../../../jsonRpc";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = ten.pow(underlyingConstants.decimals).mul(100);
  const fyTokenAmount: BigNumber = tokenAmounts.oneHundred;

  contextForTimeDependentTests("when the bond matured", function () {
    beforeEach(async function () {
      /* List the bond in the Fintroller. */
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.fyToken.address);

      /* Allow redeem fyTokens. */
      await this.contracts.fintroller
        .connect(this.signers.admin)
        .setRedeemFyTokensAllowed(this.contracts.fyToken.address, true);

      /* Mint 100 USDC and approve the Redemption Pool to spend it all. */
      await this.contracts.underlying.mint(this.signers.maker.address, underlyingAmount);
      await this.contracts.underlying
        .connect(this.signers.maker)
        .approve(this.contracts.redemptionPool.address, underlyingAmount);

      /* Supply 100 USDC to the Redemption Pool. */
      await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);

      /* Fast-forward to the future so that fyTokens can be redeemed. */
      await increaseTime(fyTokenConstants.expirationTime);
    });

    it("redeems the fyTokens", async function () {
      const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount);
      const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
    });

    it("burns the fyTokens", async function () {
      const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.maker.address);
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount);
      const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.signers.maker.address);
      expect(oldBalance).to.equal(newBalance.add(fyTokenAmount));
    });

    it("emits a Burn event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount))
        .to.emit(this.contracts.fyToken, "Burn")
        .withArgs(this.signers.maker.address, fyTokenAmount);
    });

    it("emits a Transfer event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount))
        .to.emit(this.contracts.fyToken, "Transfer")
        .withArgs(this.signers.maker.address, this.contracts.fyToken.address, fyTokenAmount);
    });
  });
}
