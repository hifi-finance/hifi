import { Block } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import { ethers } from "hardhat";
import forEach from "mocha-each";

import { H_TOKEN_EXPIRATION_TIME, MAX_UD60x18, PI, USDC_DECIMALS } from "../../../../helpers/constants";
import { mbn } from "../../../../helpers/math";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { HifiPoolErrors } from "../../../shared/errors";
import { getQuoteForSellingHToken } from "../../../shared/mirrors";

async function coreTest(
  this: Mocha.Context,
  virtualHTokenReserves: string,
  underlyingReserves: string,
  hTokenIn: string,
): Promise<void> {
  // Call the sellHToken function and calculate the delta in the underlying balance.
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hUSDC(hTokenIn));
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  const result: BigNumber = postUnderlyingBalance.sub(preUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const block: Block = await ethers.provider.getBlock("latest");
  const timeToMaturity: string = String(H_TOKEN_EXPIRATION_TIME.sub(block.timestamp));
  const expected: string = getQuoteForSellingHToken(
    virtualHTokenReserves,
    underlyingReserves,
    hTokenIn,
    timeToMaturity,
  );
  expect(expected).to.equal(result);
}

export default function shouldBehaveLikeSellHToken(): void {
  context("when the amount of hToken to sell is zero", function () {
    it("reverts", async function () {
      const hTokenOut: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenOut),
      ).to.be.revertedWith(HifiPoolErrors.SellHTokenZero);
    });
  });

  context("when the amount of hToken to sell is not zero", function () {
    const initialUnderlyingReserves: string = "100";

    beforeEach(async function () {
      // Mint an infinite amount of hTokens and underlying.
      await this.contracts.hToken.mint(this.signers.alice.address, fp(MAX_UD60x18));
      await this.contracts.underlying.mint(this.signers.alice.address, fp(MAX_UD60x18));

      // Approve the pool to spend hTokens.
      await this.contracts.hToken.connect(this.signers.alice).approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));

      // Initialize the pool.
      await this.contracts.underlying
        .connect(this.signers.alice)
        .approve(this.contracts.hifiPool.address, USDC(initialUnderlyingReserves));
      await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(initialUnderlyingReserves));
    });

    context("when there was only one liquidity provision event", function () {
      const testSets = [[PI], ["10"], ["100"]];

      forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: string) {
        const virtualHTokenReserves: string = initialUnderlyingReserves;
        await coreTest.call(this, virtualHTokenReserves, initialUnderlyingReserves, hTokenIn);
      });
    });

    context("when there were two or more liquidity provision events", function () {
      const extraUnderlyingReserves: string = "50";
      const lpTokenSupply: string = String(mbn(initialUnderlyingReserves).add(mbn(extraUnderlyingReserves)));

      beforeEach(async function () {
        // Add extra liquidity to the pool.
        await this.contracts.underlying
          .connect(this.signers.alice)
          .approve(this.contracts.hifiPool.address, USDC(extraUnderlyingReserves));
        await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(extraUnderlyingReserves));
      });

      context("when it is the first trade", function () {
        const testSets = [[PI], ["10"], ["100"]];

        forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: string) {
          const underlyingReserves: string = lpTokenSupply;
          const virtualHTokenReserves: string = underlyingReserves;
          await coreTest.call(this, virtualHTokenReserves, underlyingReserves, hTokenIn);
        });
      });

      context("when it is the second trade", function () {
        const firstHTokenIn: string = "1";

        beforeEach(async function () {
          await this.contracts.hifiPool
            .connect(this.signers.alice)
            .sellHToken(this.signers.alice.address, hUSDC(firstHTokenIn));
        });

        const testSets = [["2.141592653589793238"], ["9"], ["99"]];

        forEach(testSets).it("sells %e hTokens for underlying", async function (secondHTokenIn: string) {
          const normalizedUnderlyingReserves: string = String(
            await this.contracts.hifiPool.getNormalizedUnderlyingReserves(),
          );
          const underlyingReserves: string = String(mbn(normalizedUnderlyingReserves).div("1e18"));
          const virtualHTokenReserves: string = String(mbn(lpTokenSupply).add(firstHTokenIn));
          await coreTest.call(this, virtualHTokenReserves, underlyingReserves, secondHTokenIn);
        });
      });
    });
  });
}
