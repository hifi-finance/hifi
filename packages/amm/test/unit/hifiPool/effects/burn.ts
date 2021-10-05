import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { USDC, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

import { HifiPoolErrors } from "../../../shared/errors";

export default function shouldBehaveLikeBurn(): void {
  context("when the LP tokens returned are 0", function () {
    it("reverts", async function () {
      const poolTokensBurned: BigNumber = Zero;
      await expect(this.contracts.hifiPool.connect(this.signers.alice).burn(poolTokensBurned)).to.be.revertedWith(
        HifiPoolErrors.BURN_ZERO,
      );
    });
  });

  context("when the LP tokens returned are not 0", function () {
    context("when the total supply is 0", function () {
      it("reverts", async function () {
        await this.mocks.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
        await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
        const poolTokensBurned: BigNumber = toBn("100");
        await expect(this.contracts.hifiPool.connect(this.signers.alice).burn(poolTokensBurned)).to.be.reverted;
      });
    });

    context("when the total supply is not 0", function () {
      context("when there is phantom overflow", function () {
        beforeEach(async function () {
          await this.mocks.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(USDC("100"));
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(toBn("100"));
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(toBn("100"));
        });

        const testSets = [
          // Makes "poolTokensBurned * normalizedUnderlyingReserves" overflow.
          [Zero, toBn("1157920892373161954235709850086879078532.699846656405640395")],
          // Makes "poolTokensBurned * hTokenReserves" overflow.
          [hUSDC("1157920892373161954235709850086879078532.699846656405640395"), toBn("100")],
        ];

        forEach(testSets).it(
          "takes %e and %e and reverts",
          async function (hTokenBalance: BigNumber, poolTokensBurned: BigNumber) {
            await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(hTokenBalance);
            await expect(this.contracts.hifiPool.connect(this.signers.alice).burn(poolTokensBurned)).to.be.reverted;
          },
        );
      });

      context("when there is no phantom overflow", function () {
        context("when there are no hToken reserves", function () {
          beforeEach(async function () {
            await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
          });

          const testSets = [
            "1e-6",
            "100",
            "1729",
            "31415.92",
            "340282366920938463463.374607863536422912", // First number for which "underlyingReturned" does not overflow
          ];

          forEach(testSets).it("takes %e and burns the LP tokens", async function (poolTokensBurned: string) {
            // Mint
            const lpTokenMintAmount: BigNumber = toBn(poolTokensBurned);
            const lpTokenSupply: BigNumber = toBn(poolTokensBurned);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(lpTokenMintAmount);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(lpTokenSupply);

            // Calculate the arguments emitted in the event.
            const poolTokensBurnedBn: BigNumber = toBn(poolTokensBurned);
            const normalizedUnderlyingReserves: BigNumber = toBn(poolTokensBurned);
            const underlyingReturned: BigNumber = poolTokensBurnedBn
              .mul(normalizedUnderlyingReserves)
              .div(lpTokenMintAmount)
              .div(USDC_PRICE_PRECISION_SCALAR);
            const hTokenReturned: BigNumber = Zero;

            // Mock the necessary methods.
            await this.mocks.underlying.mock.balanceOf
              .withArgs(this.contracts.hifiPool.address)
              .returns(underlyingReturned);
            await this.mocks.underlying.mock.transfer
              .withArgs(this.signers.alice.address, underlyingReturned)
              .returns(true);

            // Burn
            await expect(this.contracts.hifiPool.connect(this.signers.alice).burn(poolTokensBurnedBn))
              .to.emit(this.contracts.hifiPool, "RemoveLiquidity")
              .withArgs(
                H_TOKEN_MATURITY_ONE_YEAR,
                this.signers.alice.address,
                underlyingReturned,
                hTokenReturned,
                poolTokensBurnedBn,
              );
          });
        });

        context("when there are hToken reserves", function () {
          const initialHTokenReserves: BigNumber = toBn("100");

          beforeEach(async function () {
            await this.mocks.hToken.mock.balanceOf
              .withArgs(this.contracts.hifiPool.address)
              .returns(initialHTokenReserves);
          });

          const testSets = [
            "1e-6",
            "100",
            "1729",
            "31415.92",
            "340282366920938463463.374607863536422912", // First number for which "underlyingReturned" does not overflow
          ];

          forEach(testSets).it("takes %e and burns the LP tokens", async function (poolTokensBurned: string) {
            // Mint
            const lpTokenMintAmount: BigNumber = toBn(poolTokensBurned);
            const lpTokenSupply: BigNumber = toBn(poolTokensBurned);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(lpTokenMintAmount);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(lpTokenSupply);

            // Calculate the arguments emitted in the event.
            const poolTokensBurnedBn: BigNumber = toBn(poolTokensBurned);
            const normalizedUnderlyingReserves: BigNumber = toBn(poolTokensBurned);
            const underlyingReturned: BigNumber = poolTokensBurnedBn
              .mul(normalizedUnderlyingReserves)
              .div(lpTokenMintAmount)
              .div(USDC_PRICE_PRECISION_SCALAR);
            const hTokenReturned = lpTokenMintAmount.mul(initialHTokenReserves).div(lpTokenSupply);

            // Mock the necessary methods.
            await this.mocks.underlying.mock.balanceOf
              .withArgs(this.contracts.hifiPool.address)
              .returns(underlyingReturned);
            await this.mocks.underlying.mock.transfer
              .withArgs(this.signers.alice.address, underlyingReturned)
              .returns(true);
            await this.mocks.hToken.mock.transfer.withArgs(this.signers.alice.address, hTokenReturned).returns(true);

            // Burn
            await expect(this.contracts.hifiPool.connect(this.signers.alice).burn(poolTokensBurnedBn))
              .to.emit(this.contracts.hifiPool, "RemoveLiquidity")
              .withArgs(
                H_TOKEN_MATURITY_ONE_YEAR,
                this.signers.alice.address,
                underlyingReturned,
                hTokenReturned,
                poolTokensBurnedBn,
              );
          });
        });
      });
    });
  });
}
