import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { contextForTimeDependentTests } from "../../../contexts";
import { fyTokenConstants } from "../../../../helpers/constants";
import { increaseTime } from "../../../jsonRpc";
import { tokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = tokenAmounts.oneHundred;
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
      await this.contracts.underlying.mint(this.accounts.maker, underlyingAmount);
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
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(underlyingAmount);
      const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
    });

    it("burns the fyTokens", async function () {
      const oldBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.maker);
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount);
      const newBalance: BigNumber = await this.contracts.fyToken.balanceOf(this.accounts.maker);
      expect(oldBalance).to.equal(newBalance.add(fyTokenAmount));
    });

    it("emits a Burn event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount))
        .to.emit(this.contracts.fyToken, "Burn")
        .withArgs(this.accounts.maker, fyTokenAmount);
    });

    it("emits a Transfer event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemFyTokens(fyTokenAmount))
        .to.emit(this.contracts.fyToken, "Transfer")
        .withArgs(this.accounts.maker, this.contracts.fyToken.address, fyTokenAmount);
    });
  });
}
