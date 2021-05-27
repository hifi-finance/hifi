import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { hTokenConstants } from "../../../../helpers/constants";
import { ten, tokenAmounts, underlyingConstants } from "../../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../contexts";
import { increaseTime } from "../../../jsonRpc";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = ten.pow(underlyingConstants.decimals).mul(100);
  const hTokenAmount: BigNumber = tokenAmounts.oneHundred;

  contextForTimeDependentTests("when the bond matured", function () {
    beforeEach(async function () {
      // List the bond in the Fintroller.
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

      // Allow redeem hTokens.
      await this.contracts.fintroller
        .connect(this.signers.admin)
        .setRedeemHTokensAllowed(this.contracts.hToken.address, true);

      // Mint 100 USDC and approve the RedemptionPool to spend it all.
      await this.contracts.underlying.mint(this.signers.maker.address, underlyingAmount);
      await this.contracts.underlying
        .connect(this.signers.maker)
        .approve(this.contracts.redemptionPool.address, underlyingAmount);

      // Supply 100 USDC to the RedemptionPool.
      await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);

      // Fast-forward to the future so that hTokens can be redeemed.
      await increaseTime(hTokenConstants.expirationTime);
    });

    it("redeems the hTokens", async function () {
      const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount);
      const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
      expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
    });

    it("burns the hTokens", async function () {
      const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.maker.address);
      await this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount);
      const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.maker.address);
      expect(oldBalance).to.equal(newBalance.add(hTokenAmount));
    });

    it("emits a Burn event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount))
        .to.emit(this.contracts.hToken, "Burn")
        .withArgs(this.signers.maker.address, hTokenAmount);
    });

    it("emits a Transfer event", async function () {
      await expect(this.contracts.redemptionPool.connect(this.signers.maker).redeemHTokens(hTokenAmount))
        .to.emit(this.contracts.hToken, "Transfer")
        .withArgs(this.signers.maker.address, this.contracts.hToken.address, hTokenAmount);
    });
  });
}
