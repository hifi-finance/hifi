import { BigNumber } from "@ethersproject/bignumber";
import { TokenAmounts } from "../../../../helpers/constants";

import { expect } from "chai";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = TokenAmounts.OneHundred;
  const yTokenAmount: BigNumber = TokenAmounts.OneHundred;

  beforeEach(async function () {
    /* List the bond in the Fintroller. */
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);

    /* Allow supply underlying. */
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setSupplyUnderlyingAllowed(this.contracts.yToken.address, true);

    /* Mint 100 DAI and approve the Redemption Pool to spend it all. */
    await this.contracts.underlying.mint(this.accounts.maker, underlyingAmount);
    await this.contracts.underlying
      .connect(this.signers.maker)
      .approve(this.contracts.redemptionPool.address, underlyingAmount);
  });

  it("supplies the underlying", async function () {
    const oldUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
    await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);
    const newUnderlyingTotalSupply: BigNumber = await this.contracts.redemptionPool.totalUnderlyingSupply();
    expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
  });

  it("mints the new yTokens", async function () {
    const oldBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.maker);
    await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);
    const newBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.maker);
    expect(oldBalance).to.equal(newBalance.sub(yTokenAmount));
  });

  it("emits a Mint event", async function () {
    await expect(this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount))
      .to.emit(this.contracts.yToken, "Mint")
      .withArgs(this.accounts.maker, yTokenAmount);
  });
}
