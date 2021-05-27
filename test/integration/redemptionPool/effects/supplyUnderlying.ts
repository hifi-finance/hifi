import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";

import { usdc } from "../../../../helpers/numbers";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  const underlyingAmount: BigNumber = usdc("100");
  const hTokenAmount: BigNumber = fp("100");

  beforeEach(async function () {
    // List the bond in the Fintroller.
    await this.contracts.fintroller.connect(this.signers.admin).listBond(this.contracts.hToken.address);

    // Allow supply underlying.
    await this.contracts.fintroller
      .connect(this.signers.admin)
      .setSupplyUnderlyingAllowed(this.contracts.hToken.address, true);

    // Mint 100 USDC and approve the RedemptionPool to spend it all.
    await this.contracts.underlying.mint(this.signers.maker.address, underlyingAmount);
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

  it("mints the new hTokens", async function () {
    const oldBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.maker.address);
    await this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount);
    const newBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.maker.address);
    expect(oldBalance).to.equal(newBalance.sub(hTokenAmount));
  });

  it("emits a Mint event", async function () {
    await expect(this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount))
      .to.emit(this.contracts.hToken, "Mint")
      .withArgs(this.signers.maker.address, hTokenAmount);
  });

  it("emits a Transfer event", async function () {
    await expect(this.contracts.redemptionPool.connect(this.signers.maker).supplyUnderlying(underlyingAmount))
      .to.emit(this.contracts.hToken, "Transfer")
      .withArgs(this.contracts.hToken.address, this.signers.maker.address, hTokenAmount);
  });
}
