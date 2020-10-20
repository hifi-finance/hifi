import { BigNumber } from "@ethersproject/bignumber";
import { TokenAmounts } from "../../../../helpers/constants";

import { expect } from "chai";

import { YTokenConstants } from "../../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../../helpers/mochaContexts";
import { increaseTime } from "../../../../helpers/jsonRpcHelpers";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = TokenAmounts.OneHundred;
  const yTokenAmount: BigNumber = TokenAmounts.OneHundred;

  contextForTimeDependentTests("when the bond matured", function () {
    beforeEach(async function () {
      /* List the bond in the Fintroller. */
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);

      /* Allow redeem yTokens. */
      await this.contracts.fintroller
        .connect(this.signers.admin)
        .setRedeemYTokensAllowed(this.contracts.yToken.address, true);

      /* Mint 100 DAI and approve the Redemption Pool to spend it all. */
      await this.contracts.underlying.mint(this.accounts.maker, underlyingAmount);
      await this.contracts.underlying
        .connect(this.signers.maker)
        .approve(this.contracts.redemptionPool.address, underlyingAmount);

      /* Supply 100 DAI to the Redemption Pool. */
      await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);

      /* Fast-forward to the future so that yTokens can be redeemed. */
      await increaseTime(YTokenConstants.ExpirationTime);
    });

    it("redeems the yTokens", async function () {
      const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemYTokens(underlyingAmount);
      const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
    });

    it("burns the yTokens", async function () {
      const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.maker);
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemYTokens(yTokenAmount);
      const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.maker);
      expect(oldBalance).to.equal(newBalance.add(yTokenAmount));
    });

    it("emits a Burn event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemYTokens(yTokenAmount))
        .to.emit(this.contracts.yToken, "Burn")
        .withArgs(this.accounts.maker, yTokenAmount);
    });
  });
}
