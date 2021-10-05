import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { USDC, getNow, hUSDC } from "@hifi/helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { fromBn, toBn } from "evm-bn";
import forEach from "mocha-each";
import { SCALE } from "prb-math.js";

import { HifiPoolErrors, YieldSpaceErrors } from "../../../shared/errors";
import { getLatestBlockTimestamp } from "../../../shared/helpers";
import { getQuoteForSellingHToken } from "../../../shared/mirrors";

async function testSellHToken(
  this: Mocha.Context,
  virtualHTokenReserves: BigNumber,
  normalizedUnderlyingReserves: BigNumber,
  hTokenIn: BigNumber,
): Promise<void> {
  const seller: SignerWithAddress = this.signers.alice;

  // Call the sellHToken function and calculate the delta in the token balances.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(seller.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(seller.address);
  await this.contracts.hifiPool.connect(seller).sellHToken(seller.address, hTokenIn);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(seller.address);
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(seller.address);

  const actualUnderlyingOut: BigNumber = postUnderlyingBalance.sub(preUnderlyingBalance);
  const actualHTokenIn: BigNumber = preHTokenBalance.sub(postHTokenBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: BigNumber = H_TOKEN_MATURITY_ONE_YEAR.sub(await getLatestBlockTimestamp()).mul(SCALE);
  const normalizedUnderlyingOut: BigNumber = getQuoteForSellingHToken(
    virtualHTokenReserves,
    normalizedUnderlyingReserves,
    hTokenIn,
    timeToMaturity,
  );
  const underlyingOut: BigNumber = normalizedUnderlyingOut.div(USDC_PRICE_PRECISION_SCALAR);

  // Run the tests.
  expect(hTokenIn).to.equal(actualHTokenIn);
  expect(underlyingOut).to.equal(actualUnderlyingOut);
}

export function shouldBehaveLikeSellHToken(): void {
  context("when the amount of hTokens to sell is zero", function () {
    it("reverts", async function () {
      const hTokenIn: BigNumber = Zero;
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
      ).to.be.revertedWith(HifiPoolErrors.SELL_H_TOKEN_ZERO);
    });
  });

  context("when the amount of hTokens to sell is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const hTokenIn: BigNumber = hUSDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
        ).to.be.revertedWith(HifiPoolErrors.BOND_MATURED);
      });
    });

    context("when the bond did not mature", function () {
      context("when there is no underlying in the pool", function () {
        it("reverts", async function () {
          const hTokenIn: BigNumber = hUSDC("10");
          await expect(
            this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
          ).to.be.revertedWith(YieldSpaceErrors.UNDERLYING_OUT_FOR_H_TOKEN_IN_RESERVES_FACTORS_UNDERFLOW);
        });
      });

      context("when there is underlying in the pool", function () {
        const initialNormalizedUnderlyingReserves: BigNumber = toBn("100");

        beforeEach(async function () {
          // Initialize the pool.
          const initialUnderlyingReserves: BigNumber = USDC(fromBn(initialNormalizedUnderlyingReserves));
          await this.contracts.hifiPool.connect(this.signers.alice).mint(initialUnderlyingReserves);
        });

        context("when liquidity was provided once", function () {
          const testSets = [hUSDC("3.141592653589793238"), hUSDC("10"), hUSDC("100")];

          forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: BigNumber) {
            const virtualHTokenReserves: BigNumber = initialNormalizedUnderlyingReserves;
            await testSellHToken.call(this, virtualHTokenReserves, initialNormalizedUnderlyingReserves, hTokenIn);
          });
        });

        context("when liquidity was provided twice or more times", function () {
          const extraNormalizedUnderlyingAmount: BigNumber = toBn("50");
          const lpTokenSupply: BigNumber = initialNormalizedUnderlyingReserves.add(extraNormalizedUnderlyingAmount);

          beforeEach(async function () {
            // Add extra liquidity to the pool.
            const extraUnderlyingAmount: BigNumber = USDC(fromBn(extraNormalizedUnderlyingAmount));
            await this.contracts.hifiPool.connect(this.signers.alice).mint(extraUnderlyingAmount);
          });

          context("when it is the first trade", function () {
            const testSets = [hUSDC("3.141592653589793238"), hUSDC("10"), hUSDC("100")];

            forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: BigNumber) {
              const virtualHTokenReserves: BigNumber = lpTokenSupply;
              const normalizedUnderlyingReserves: BigNumber = lpTokenSupply;
              await testSellHToken.call(this, virtualHTokenReserves, normalizedUnderlyingReserves, hTokenIn);
            });
          });

          context("when it is the second trade", function () {
            const firstHTokenIn: BigNumber = hUSDC("1");
            let normalizedUnderlyingReserves: BigNumber;
            let virtualHTokenReserves: BigNumber;

            beforeEach(async function () {
              // Do the first trade.
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellHToken(this.signers.alice.address, firstHTokenIn);

              // Get the amounts needed for the second trade tests.
              normalizedUnderlyingReserves = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
            });

            const testSets = [hUSDC("2.141592653589793238"), hUSDC("9"), hUSDC("99")];

            forEach(testSets).it("sells %e hTokens for underlying", async function (secondHTokenIn: BigNumber) {
              virtualHTokenReserves = lpTokenSupply.add(firstHTokenIn);
              await testSellHToken.call(this, virtualHTokenReserves, normalizedUnderlyingReserves, secondHTokenIn);
            });

            forEach(testSets).it(
              "sells %e hTokens for underlying and emits a Trade event",
              async function (secondHTokenIn: BigNumber) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .sellHToken(this.signers.alice.address, secondHTokenIn),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
