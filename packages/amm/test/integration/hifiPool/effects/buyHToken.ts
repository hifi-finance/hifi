import type { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { HifiPoolErrors, YieldSpaceErrors } from "@hifi/errors";
import { USDC, getNow, hUSDC } from "@hifi/helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SCALE } from "@prb/math";
import { expect } from "chai";
import { fromBn, toBn } from "evm-bn";
import forEach from "mocha-each";

import { getLatestBlockTimestamp } from "../../../shared/helpers";
import { getQuoteForBuyingHToken } from "../../../shared/mirrors";

async function testBuyHToken(
  this: Mocha.Context,
  virtualHTokenReserves: BigNumber,
  normalizedUnderlyingReserves: BigNumber,
  hTokenOut: BigNumber,
): Promise<void> {
  const buyer: SignerWithAddress = this.signers.alice;

  // Call the buyHToken function and calculate the delta in the hToken balance.
  const oldHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(buyer.address);
  const oldUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(buyer.address);
  await this.contracts.hifiPool.connect(buyer).buyHToken(buyer.address, hTokenOut);
  const newHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(buyer.address);
  const newUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(buyer.address);

  const actualHTokenOut: BigNumber = newHTokenBalance.sub(oldHTokenBalance);
  const actualUnderlyingIn: BigNumber = oldUnderlyingBalance.sub(newUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: BigNumber = H_TOKEN_MATURITY_ONE_YEAR.sub(await getLatestBlockTimestamp()).mul(SCALE);
  const normalizedUnderlyingIn: BigNumber = getQuoteForBuyingHToken(
    virtualHTokenReserves,
    normalizedUnderlyingReserves,
    hTokenOut,
    timeToMaturity,
  );
  const underlyingIn: BigNumber = normalizedUnderlyingIn.div(USDC_PRICE_PRECISION_SCALAR);

  // Run the tests.
  expect(hTokenOut).to.equal(actualHTokenOut);
  expect(underlyingIn).to.equal(actualUnderlyingIn);
}

export function shouldBehaveLikeBuyHToken(): void {
  context("when the amount of hTokens to buy is zero", function () {
    it("reverts", async function () {
      const hTokenOut: BigNumber = Zero;
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
      ).to.be.revertedWith(HifiPoolErrors.BUY_H_TOKEN_ZERO);
    });
  });

  context("when the amount of hTokens to buy is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const hTokenOut: BigNumber = hUSDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
        ).to.be.revertedWith(HifiPoolErrors.BOND_MATURED);
      });
    });

    context("when the bond did not mature", function () {
      context("when there are no hTokens in the pool", function () {
        it("reverts", async function () {
          const hTokenOut: BigNumber = hUSDC("10");
          await expect(
            this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
          ).to.be.revertedWith(YieldSpaceErrors.H_TOKEN_RESERVES_UNDERFLOW);
        });
      });

      context("when there are hTokens in the pool", function () {
        const initialHTokenReserves: BigNumber = hUSDC("100");
        const initialNormalizedUnderlyingReserves: BigNumber = toBn("100");

        beforeEach(async function () {
          // Initialize the pool.
          const initialUnderlyingReserves: BigNumber = USDC(fromBn(initialNormalizedUnderlyingReserves));
          await this.contracts.hifiPool.connect(this.signers.alice).mint(initialUnderlyingReserves);

          // Transfer hTokens to the pool.
          await this.contracts.hToken
            .connect(this.signers.alice)
            .transfer(this.contracts.hifiPool.address, initialHTokenReserves);
        });

        context("when the calculated amount of underlying to sell is zero", function () {
          it("reverts", async function () {
            const hTokenOut: BigNumber = hUSDC("1e-7");
            await expect(
              this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
            ).to.be.revertedWith(HifiPoolErrors.BUY_H_TOKEN_UNDERLYING_ZERO);
          });
        });

        context("when the calculated amount of underlying to sell is not zero", function () {
          context("when the interest rate turns negative", function () {
            it("reverts", async function () {
              const hTokenOut: BigNumber = hUSDC("100");
              await expect(
                this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
              ).to.be.revertedWith(HifiPoolErrors.NEGATIVE_INTEREST_RATE);
            });
          });

          context("when the interest rate does not turn negative", function () {
            const lpTokenSupply: BigNumber = initialNormalizedUnderlyingReserves;

            context("when it is the first trade", function () {
              const testSets = [hUSDC("3.141592653589793238"), hUSDC("10"), hUSDC("25")];

              forEach(testSets).it("buys %e hTokens with underlying", async function (hTokenOut: BigNumber) {
                const virtualHTokenReserves: BigNumber = lpTokenSupply.add(initialHTokenReserves);
                await testBuyHToken.call(this, virtualHTokenReserves, initialNormalizedUnderlyingReserves, hTokenOut);
              });
            });

            context("when it is the second trade", function () {
              const firstHTokenOut: BigNumber = hUSDC("1");
              let normalizedUnderlyingReserves: BigNumber;

              beforeEach(async function () {
                // Do the first trade.
                await this.contracts.hifiPool
                  .connect(this.signers.alice)
                  .buyHToken(this.signers.alice.address, firstHTokenOut);

                // Get the amounts needed for the second trade tests.
                normalizedUnderlyingReserves = await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
              });

              const testSets = [hUSDC("2.141592653589793238"), hUSDC("9"), hUSDC("24")];

              forEach(testSets).it("buys %e hTokens with underlying", async function (secondHTokenOut: BigNumber) {
                const virtualHTokenReserves: BigNumber = lpTokenSupply.add(initialHTokenReserves).sub(firstHTokenOut);
                await testBuyHToken.call(this, virtualHTokenReserves, normalizedUnderlyingReserves, secondHTokenOut);
              });

              forEach(testSets).it(
                "buys %e hTokens with underlying and emits a Trade event",
                async function (secondHTokenOut: BigNumber) {
                  await expect(
                    this.contracts.hifiPool
                      .connect(this.signers.alice)
                      .buyHToken(this.signers.alice.address, secondHTokenOut),
                  ).to.emit(this.contracts.hifiPool, "Trade");
                },
              );
            });
          });
        });
      });
    });
  });
}
