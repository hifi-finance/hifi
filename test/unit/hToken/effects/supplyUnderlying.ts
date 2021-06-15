import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";
import fp from "evm-fp";

import { bn, precisionScalarForDecimals, usdc } from "../../../../helpers/numbers";
import { HTokenErrors } from "../../../shared/errors";

export default function shouldBehaveLikeSupplyUnderlying(): void {
  context("when the amount of underlying to supply is zero", function () {
    it("reverts", async function () {
      const underlyingSupplyAmount: BigNumber = Zero;
      await expect(
        this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingSupplyAmount),
      ).to.be.revertedWith(HTokenErrors.SupplyUnderlyingZero);
    });
  });

  context("when the amount of underlying to supply is not zero", function () {
    const underlyingAmount: BigNumber = usdc("100");
    const hTokenAmount: BigNumber = fp("100");

    context("when the underlying has 18 decimals", function () {
      const localUnderlyingAmount: BigNumber = fp("100", 18);

      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(bn("1"));
        await this.mocks.usdc.mock.transferFrom
          .withArgs(this.signers.maker.address, this.contracts.hTokens[0].address, localUnderlyingAmount)
          .returns(true);
      });

      it("makes the underlying supply", async function () {
        const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
        await this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(localUnderlyingAmount);
        const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
        expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.sub(localUnderlyingAmount));
      });
    });

    context("when the underlying has 6 decimals", function () {
      beforeEach(async function () {
        await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(precisionScalarForDecimals(bn("6")));
        await this.mocks.usdc.mock.transferFrom
          .withArgs(this.signers.maker.address, this.contracts.hTokens[0].address, underlyingAmount)
          .returns(true);
      });

      it("makes the underlying supply", async function () {
        const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
        await this.contracts.hTokens[0].connect(this.signers.maker).supplyUnderlying(underlyingAmount);
        const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingSupply();
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
