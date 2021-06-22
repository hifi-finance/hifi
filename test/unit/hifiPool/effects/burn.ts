import {} from "../../../shared/errors";

import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { H_TOKEN_MATURITY, UNDERLYING_PRECISION_SCALAR } from "../../../../helpers/constants";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import Errors from "../../../shared/errors";

export default function shouldBehaveLikeBurn(): void {
  context("when the pool tokens returned are 0", function () {
    it("reverts", async function () {
      const poolTokensBurned: BigNumber = bn("0");
      await expect(this.contracts.hifiPool.burn(poolTokensBurned)).to.be.revertedWith(Errors.BurnZero);
    });
  });

  context("when the pool tokens returned are not 0", function () {
    context("when the total supply is 0", function () {
      it("reverts", async function () {
        await this.mocks.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
        await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
        const poolTokensBurned: BigNumber = fp("100");
        await expect(this.contracts.hifiPool.burn(poolTokensBurned)).to.be.reverted;
      });
    });

    context("when the total supply is not 0", function () {
      context("when there is phantom overflow", function () {
        beforeEach(async function () {
          await this.mocks.underlying.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(USDC("100"));
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(fp("100"));
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(fp("100"));
        });

        const testSets = [
          // Makes "poolTokensBurned * normalizedUnderlyingReserves" overflow.
          [hUSDC("0"), fp("1157920892373161954235709850086879078532.699846656405640395")],
          // Makes "poolTokensBurned * hTokenReserves" overflow.
          [hUSDC("1157920892373161954235709850086879078532.699846656405640395"), fp("100")],
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
            await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(bn("0"));
          });

          const testSets = [
            ["1e-6"],
            ["100"],
            ["1729"],
            ["31415.92"],
            ["340282366920938463463.374607863536422912"], // First number for which "underlyingReturned" does not overflow
          ];

          forEach(testSets).it("takes %e and burns the LP tokens", async function (poolTokensBurned: string) {
            // Mint
            const lpTokenMintAmount: BigNumber = fp(poolTokensBurned);
            const lpTokenSupply: BigNumber = fp(poolTokensBurned);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(lpTokenMintAmount);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(lpTokenSupply);

            // Calculate the arguments emitted in the event.
            const poolTokensBurnedBn: BigNumber = fp(poolTokensBurned);
            const normalizedUnderlyingReserves: BigNumber = fp(poolTokensBurned);
            const underlyingReturned: BigNumber = poolTokensBurnedBn
              .mul(normalizedUnderlyingReserves)
              .div(lpTokenMintAmount)
              .div(UNDERLYING_PRECISION_SCALAR);
            const hTokenReturned: BigNumber = bn("0");

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
                H_TOKEN_MATURITY,
                this.signers.alice.address,
                underlyingReturned,
                hTokenReturned,
                poolTokensBurnedBn,
              );
          });
        });

        context("when there are hToken reserves", function () {
          const initialHTokenReserves: BigNumber = fp("100");

          beforeEach(async function () {
            await this.mocks.hToken.mock.balanceOf
              .withArgs(this.contracts.hifiPool.address)
              .returns(initialHTokenReserves);
          });

          const testSets = [
            ["1e-6"],
            ["100"],
            ["1729"],
            ["31415.92"],
            ["340282366920938463463.374607863536422912"], // First number for which "underlyingReturned" does not overflow
          ];

          forEach(testSets).it("takes %e and burns the LP tokens", async function (poolTokensBurned: string) {
            // Mint
            const lpTokenMintAmount: BigNumber = fp(poolTokensBurned);
            const lpTokenSupply: BigNumber = fp(poolTokensBurned);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(lpTokenMintAmount);
            await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(lpTokenSupply);

            // Calculate the arguments emitted in the event.
            const poolTokensBurnedBn: BigNumber = fp(poolTokensBurned);
            const normalizedUnderlyingReserves: BigNumber = fp(poolTokensBurned);
            const underlyingReturned: BigNumber = poolTokensBurnedBn
              .mul(normalizedUnderlyingReserves)
              .div(lpTokenMintAmount)
              .div(UNDERLYING_PRECISION_SCALAR);
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
                H_TOKEN_MATURITY,
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
