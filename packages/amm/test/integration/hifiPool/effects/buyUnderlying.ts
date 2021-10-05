import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR, USDC_PRICE_PRECISION_SCALAR } from "@hifi/constants";
import { USDC, getNow } from "@hifi/helpers";
import { expect } from "chai";
import forEach from "mocha-each";
import { toBn, fromBn } from "evm-bn";

import { SCALE } from "prb-math.js";
import { EPSILON } from "../../../shared/constants";
import { HifiPoolErrors, YieldSpaceErrors } from "../../../shared/errors";
import { getLatestBlockTimestamp } from "../../../shared/helpers";
import { getQuoteForBuyingUnderlying } from "../../../shared/mirrors";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function testBuyUnderlying(
  this: Mocha.Context,
  normalizedUnderlyingReserves: BigNumber,
  virtualHTokenReserves: BigNumber,
  underlyingOut: BigNumber,
): Promise<void> {
  const buyer: SignerWithAddress = this.signers.alice;

  // Call the buyUnderlying function and calculate the delta in the token balances.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(buyer.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(buyer.address);
  await this.contracts.hifiPool.connect(buyer).buyUnderlying(buyer.address, underlyingOut);
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(buyer.address);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(buyer.address);

  const actualHTokenIn: BigNumber = preHTokenBalance.sub(postHTokenBalance);
  const actualUnderlyingOut: BigNumber = postUnderlyingBalance.sub(preUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: BigNumber = H_TOKEN_MATURITY_ONE_YEAR.sub(await getLatestBlockTimestamp()).mul(SCALE);
  const normalizedUnderlyingOut: BigNumber = underlyingOut.mul(USDC_PRICE_PRECISION_SCALAR);
  const hTokenIn: BigNumber = getQuoteForBuyingUnderlying(
    normalizedUnderlyingReserves,
    virtualHTokenReserves,
    normalizedUnderlyingOut,
    timeToMaturity,
  );

  // Run the tests.
  expect(hTokenIn.sub(actualHTokenIn).abs()).to.be.lte(EPSILON);
  expect(underlyingOut).to.equal(actualUnderlyingOut);
}

export default function shouldBehaveLikeBuyUnderlying(): void {
  context("when the amount of underlying to buy is zero", function () {
    it("reverts", async function () {
      const underlyingOut: BigNumber = Zero;
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
      ).to.be.revertedWith(HifiPoolErrors.BUY_UNDERLYING_ZERO);
    });
  });

  context("when the amount of underlying to buy is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const underlyingOut: BigNumber = USDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
        ).to.be.revertedWith(HifiPoolErrors.BOND_MATURED);
      });
    });

    context("when the bond did not mature", function () {
      context("when there is no underlying in the pool", function () {
        it("reverts", async function () {
          const underlyingOut: BigNumber = USDC("10");
          await expect(
            this.contracts.hifiPool
              .connect(this.signers.alice)
              .buyUnderlying(this.signers.alice.address, underlyingOut),
          ).to.be.revertedWith(YieldSpaceErrors.UNDERLYING_RESERVES_UNDERFLOW);
        });
      });

      context("when there is underlying in the pool", function () {
        const initialNormalizedUnderlyingReserves: BigNumber = toBn("100");

        beforeEach(async function () {
          // Initialize the pool
          const initialUnderlyingReserves: BigNumber = USDC(fromBn(initialNormalizedUnderlyingReserves));
          await this.contracts.hifiPool.connect(this.signers.alice).mint(initialUnderlyingReserves);
        });

        context("when liquidity was provided once", function () {
          const testSets = [USDC("3.141592"), USDC("10"), USDC("100")];

          forEach(testSets).it("buys %e underlying with hTokens", async function (underlyingOut: BigNumber) {
            const virtualHTokenReserves: BigNumber = initialNormalizedUnderlyingReserves;
            await testBuyUnderlying.call(
              this,
              initialNormalizedUnderlyingReserves,
              virtualHTokenReserves,
              underlyingOut,
            );
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
            const testSets = [USDC("3.141592"), USDC("10"), USDC("100")];

            forEach(testSets).it("buys %e underlying with hTokens", async function (underlyingOut: BigNumber) {
              const normalizedUnderlyingReserves: BigNumber = lpTokenSupply;
              const virtualHTokenReserves: BigNumber = lpTokenSupply;
              await testBuyUnderlying.call(this, normalizedUnderlyingReserves, virtualHTokenReserves, underlyingOut);
            });
          });

          context("when it is the second trade", function () {
            const firstNormalizedUnderlyingOut: BigNumber = toBn("1");
            let virtualHTokenReserves: BigNumber;

            beforeEach(async function () {
              // Do the first trade.
              const firstUnderlyingOut: BigNumber = USDC(fromBn(firstNormalizedUnderlyingOut));
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .buyUnderlying(this.signers.alice.address, firstUnderlyingOut);

              // Get the amounts needed for the second trade tests.
              virtualHTokenReserves = await this.contracts.hifiPool.getVirtualHTokenReserves();
            });

            const testSets = [USDC("2.141592"), USDC("9"), USDC("99")];

            forEach(testSets).it("buys %e underlying with hTokens", async function (secondUnderlyingOut: BigNumber) {
              const normalizedUnderlyingReserves: BigNumber = lpTokenSupply.sub(firstNormalizedUnderlyingOut);
              await testBuyUnderlying.call(
                this,
                normalizedUnderlyingReserves,
                virtualHTokenReserves,
                secondUnderlyingOut,
              );
            });

            forEach(testSets).it(
              "buys %e underlying with hTokens and emits a Trade event",
              async function (secondUnderlyingOut: BigNumber) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .buyUnderlying(this.signers.alice.address, secondUnderlyingOut),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
