import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { EPSILON, H_TOKEN_MATURITY, MAX_UD60x18 } from "../../../../helpers/constants";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { getLatestBlockTimestamp } from "../../../../helpers/provider";
import Errors from "../../../shared/errors";
import { getQuoteForBuyingUnderlying } from "../../../shared/mirrors";

async function testBuyUnderlying(
  this: Mocha.Context,
  underlyingReserves: string,
  hTokenReserves: string,
  underlyingOut: string,
): Promise<void> {
  // Call the buyUnderlying function and calculate the delta in the hToken balance.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool
    .connect(this.signers.alice)
    .buyUnderlying(this.signers.alice.address, USDC(underlyingOut));
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const result: BigNumber = preHTokenBalance.sub(postHTokenBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: string = String(H_TOKEN_MATURITY.sub(await getLatestBlockTimestamp()));
  const expected: string = getQuoteForBuyingUnderlying(
    underlyingReserves,
    hTokenReserves,
    underlyingOut,
    timeToMaturity,
  );
  const delta: BigNumber = hUSDC(expected).sub(result).abs();
  expect(delta).to.be.lte(EPSILON);
}

export default function shouldBehaveLikeBuyUnderlying(): void {
  context("when the amount of underlying to buy is zero", function () {
    it("reverts", async function () {
      const underlyingOut: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
      ).to.be.revertedWith(Errors.BuyUnderlyingZero);
    });
  });

  context("when the amount of underlying to buy is not zero", function () {
    context("when there is no underlying in the pool", function () {
      it("reverts", async function () {
        const underlyingOut: BigNumber = USDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
        ).to.be.revertedWith(Errors.UnderlyingReservesUnderflow);
      });
    });

    context("when there is underlying in the pool", function () {
      const initialUnderlyingReserves: string = "100";

      beforeEach(async function () {
        // Mint an infinite amount of hTokens and underlying.
        await this.contracts.hToken.mint(this.signers.alice.address, fp(MAX_UD60x18));
        await this.contracts.underlying.mint(this.signers.alice.address, fp(MAX_UD60x18));

        // Approve the pool to spend an infinite amount of hTokens and underlying.
        await this.contracts.hToken
          .connect(this.signers.alice)
          .approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));
        await this.contracts.underlying
          .connect(this.signers.alice)
          .approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));

        // Initialize the pool
        await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(initialUnderlyingReserves));
      });

      context("when liquidity was provided once", function () {
        const testSets = [["3.141592"], ["10"], ["100"]];

        forEach(testSets).it("buys %e underlying with hTokens", async function (underlyingOut: string) {
          const virtualHTokenReserves: string = initialUnderlyingReserves;
          await testBuyUnderlying.call(this, initialUnderlyingReserves, virtualHTokenReserves, underlyingOut);
        });
      });
    });
  });
}
