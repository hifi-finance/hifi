import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { HifiPoolErrors, YieldSpaceErrors } from "@hifi/errors";
import { USDC, getNow, hUSDC } from "@hifi/helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { fromBn, toBn } from "evm-bn";
import forEach from "mocha-each";
import { SCALE } from "prb-math";

import { EPSILON } from "../../../shared/constants";
import { getLatestBlockTimestamp } from "../../../shared/helpers";
import { getQuoteForSellingUnderlying } from "../../../shared/mirrors";

async function testSellUnderlying(
  this: Mocha.Context,
  normalizedUnderlyingReserves: BigNumber,
  virtualHTokenReserves: BigNumber,
  underlyingIn: BigNumber,
): Promise<void> {
  const seller: SignerWithAddress = this.signers.alice;

  // Call the sellUnderlying function and calculate the delta in the hToken balance.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(seller.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(seller.address);
  await this.contracts.hifiPool.connect(seller).sellUnderlying(seller.address, underlyingIn);
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(seller.address);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(seller.address);

  const actualHTokenOut: BigNumber = postHTokenBalance.sub(preHTokenBalance);
  const actualUnderlyingIn: BigNumber = preUnderlyingBalance.sub(postUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: BigNumber = H_TOKEN_MATURITY_ONE_YEAR.sub(await getLatestBlockTimestamp()).mul(SCALE);
  const normalizedUnderlyingIn: BigNumber = underlyingIn.mul(USDC_PRICE_PRECISION_SCALAR);
  const hTokenOut: BigNumber = getQuoteForSellingUnderlying(
    normalizedUnderlyingReserves,
    virtualHTokenReserves,
    normalizedUnderlyingIn,
    timeToMaturity,
  );

  // Run the tests.
  expect(hTokenOut.sub(actualHTokenOut).abs()).to.be.lte(EPSILON);
  expect(underlyingIn).to.equal(actualUnderlyingIn);
}

export function shouldBehaveLikeSellUnderlying(): void {
  context("when the amount of underlying to sell is zero", function () {
    it("reverts", async function () {
      const hTokenOut: BigNumber = Zero;
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).sellUnderlying(this.signers.alice.address, hTokenOut),
      ).to.be.revertedWith(HifiPoolErrors.SELL_UNDERLYING_ZERO);
    });
  });

  context("when the amount of underlying to sell is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const underlyingIn: BigNumber = USDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).sellUnderlying(this.signers.alice.address, underlyingIn),
        ).to.be.revertedWith(HifiPoolErrors.BOND_MATURED);
      });
    });

    context("when the bond did not mature", function () {
      context("when there are no hTokens in the pool", function () {
        it("reverts", async function () {
          const underlyingIn: BigNumber = USDC("10");
          await expect(
            this.contracts.hifiPool
              .connect(this.signers.alice)
              .sellUnderlying(this.signers.alice.address, underlyingIn),
          ).to.be.revertedWith(YieldSpaceErrors.H_TOKEN_OUT_FOR_UNDERLYING_IN_RESERVES_FACTORS_UNDERFLOW);
        });
      });

      context("when there are hTokens in the pool", function () {
        const initialHTokenReserves: BigNumber = hUSDC("100");
        const initialNormalizedUnderlyingReserves: BigNumber = toBn("100");

        beforeEach(async function () {
          const initialUnderlyingReserves: BigNumber = USDC(fromBn(initialNormalizedUnderlyingReserves));

          // Initialize the pool.
          await this.contracts.hifiPool.connect(this.signers.alice).mint(initialUnderlyingReserves);

          // Transfer hTokens to the pool.
          await this.contracts.hToken
            .connect(this.signers.alice)
            .transfer(this.contracts.hifiPool.address, initialHTokenReserves);
        });

        context("when the interest rate turns negative", function () {
          it("reverts", async function () {
            const underlyingIn: BigNumber = USDC("100");
            await expect(
              this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellUnderlying(this.signers.alice.address, underlyingIn),
            ).to.be.revertedWith(HifiPoolErrors.NEGATIVE_INTEREST_RATE);
          });
        });

        context("when the interest rate does not turn negative", function () {
          const lpTokenSupply: BigNumber = initialNormalizedUnderlyingReserves;

          context("when it is the first trade", function () {
            const testSets = [USDC("3.141592"), USDC("10"), USDC("25")];

            forEach(testSets).it("sells %e underlying for hTokens", async function (underlyingIn: BigNumber) {
              const virtualHTokenReserves: BigNumber = lpTokenSupply.add(initialHTokenReserves);
              await testSellUnderlying.call(
                this,
                initialNormalizedUnderlyingReserves,
                virtualHTokenReserves,
                underlyingIn,
              );
            });
          });

          context("when it is the second trade", function () {
            const firstNormalizedUnderlyingIn: BigNumber = toBn("1");
            let virtualHTokenReserves: BigNumber;

            beforeEach(async function () {
              // Do the first trade.
              const firstUnderlyingIn: BigNumber = USDC(fromBn(firstNormalizedUnderlyingIn));
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellUnderlying(this.signers.alice.address, firstUnderlyingIn);

              // Get the amounts needed for the second trade tests.
              virtualHTokenReserves = await this.contracts.hifiPool.getVirtualHTokenReserves();
            });

            const testSets = [USDC("2.141592"), USDC("9"), USDC("24")];

            forEach(testSets).it("sells %e underlying for hTokens", async function (secondUnderlyingIn: BigNumber) {
              const normalizedUnderlyingReserves: BigNumber = lpTokenSupply.add(firstNormalizedUnderlyingIn);
              await testSellUnderlying.call(
                this,
                normalizedUnderlyingReserves,
                virtualHTokenReserves,
                secondUnderlyingIn,
              );
            });

            forEach(testSets).it(
              "sells %e underlying for hTokens and emits a Trade event",
              async function (secondUnderlyingIn: BigNumber) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .sellUnderlying(this.signers.alice.address, secondUnderlyingIn),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
