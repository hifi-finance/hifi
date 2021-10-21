import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { HTokenErrors } from "@hifi/errors";
import { getPrecisionScalar, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";

export function shouldBehaveLikeSupplyUnderlying(): void {
  context("when the amount of underlying to supply is zero", function () {
    it("reverts", async function () {
      const underlyingSupplyAmount: BigNumber = Zero;
      await expect(
        this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingSupplyAmount),
      ).to.be.revertedWith(HTokenErrors.SUPPLY_UNDERLYING_ZERO);
    });
  });

  context("when the amount of underlying to supply is not zero", function () {
    const hTokenAmount: BigNumber = hUSDC("100");

    context("when the underlying has 18 decimals", function () {
      const underlyingAmount: BigNumber = toBn("100", 18);

      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(1);
        await this.mocks.usdc.mock.transferFrom
          .withArgs(this.signers.maker.address, this.contracts.hTokens[0].address, underlyingAmount)
          .returns(true);
      });

      it("makes the underlying supply", async function () {
        const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        await this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingAmount);
        const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
      });
    });

    context("when the underlying has 6 decimals", function () {
      const underlyingAmount: BigNumber = toBn("100", 6);

      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(getPrecisionScalar(6));
        await this.mocks.usdc.mock.transferFrom
          .withArgs(this.signers.maker.address, this.contracts.hTokens[0].address, underlyingAmount)
          .returns(true);
      });

      it("makes the underlying supply", async function () {
        const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        await this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingAmount);
        const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
      });
    });

    context("when the underlying has 1 decimal", function () {
      const underlyingAmount: BigNumber = toBn("100", 1);

      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(getPrecisionScalar(1));
        await this.mocks.usdc.mock.transferFrom
          .withArgs(this.signers.maker.address, this.contracts.hTokens[0].address, underlyingAmount)
          .returns(true);
      });

      it("makes the underlying supply", async function () {
        const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        await this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingAmount);
        const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
        expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(underlyingAmount));
      });

      it("emits a SupplyUnderlying event", async function () {
        await expect(this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingAmount))
          .to.emit(this.contracts.hTokens[0], "SupplyUnderlying")
          .withArgs(this.signers.maker.address, underlyingAmount, hTokenAmount);
      });
    });
  });
}
