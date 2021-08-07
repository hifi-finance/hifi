import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { EPSILON, H_TOKEN_MATURITY } from "../../../../helpers/constants";
import { add, div, sub } from "../../../../helpers/math";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { getLatestBlockTimestamp } from "../../../../helpers/provider";
import { now } from "../../../../helpers/time";
import { HifiPoolErrors, YieldSpaceErrors } from "../../../shared/errors";
import { getQuoteForBuyingUnderlying } from "../../../shared/mirrors";

async function testBuyUnderlying(
  this: Mocha.Context,
  underlyingReserves: string,
  hTokenReserves: string,
  underlyingOut: string,
): Promise<void> {
  // Call the buyUnderlying function and calculate the delta in the token balances.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool
    .connect(this.signers.alice)
    .buyUnderlying(this.signers.alice.address, USDC(underlyingOut));
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);

  const actualHTokenIn: BigNumber = preHTokenBalance.sub(postHTokenBalance);
  const actualUnderlyingOut: BigNumber = postUnderlyingBalance.sub(preUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: string = String(H_TOKEN_MATURITY.sub(await getLatestBlockTimestamp()));
  const expectedHTokenIn: string = getQuoteForBuyingUnderlying(
    underlyingReserves,
    hTokenReserves,
    underlyingOut,
    timeToMaturity,
  );

  // Run the tests.
  expect(hUSDC(expectedHTokenIn).sub(actualHTokenIn).abs()).to.be.lte(EPSILON);
  expect(USDC(underlyingOut)).to.equal(actualUnderlyingOut);
}

export default function shouldBehaveLikeBuyUnderlying(): void {
  context("when the amount of underlying to buy is zero", function () {
    it("reverts", async function () {
      const underlyingOut: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
      ).to.be.revertedWith(HifiPoolErrors.BuyUnderlyingZero);
    });
  });

  context("when the amount of underlying to buy is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = now().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const underlyingOut: BigNumber = USDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).buyUnderlying(this.signers.alice.address, underlyingOut),
        ).to.be.revertedWith(HifiPoolErrors.BondMatured);
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
          ).to.be.revertedWith(YieldSpaceErrors.UnderlyingReservesUnderflow);
        });
      });

      context("when there is underlying in the pool", function () {
        const initialUnderlyingReserves: string = "100";

        beforeEach(async function () {
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

        context("when liquidity was provided twice or more times", function () {
          const extraUnderlyingReserves: string = "50";
          const lpTokenSupply: string = add(initialUnderlyingReserves, extraUnderlyingReserves);

          beforeEach(async function () {
            // Add extra liquidity to the pool.
            await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(extraUnderlyingReserves));
          });

          context("when it is the first trade", function () {
            const testSets = [["3.141592"], ["10"], ["100"]];

            forEach(testSets).it("buys %e underlying with hTokens", async function (underlyingOut: string) {
              const underlyingReserves: string = lpTokenSupply;
              const virtualHTokenReserves: string = lpTokenSupply;
              await testBuyUnderlying.call(this, underlyingReserves, virtualHTokenReserves, underlyingOut);
            });
          });

          context("when it is the second trade", function () {
            const firstUnderlyingOut: string = "1";
            let virtualHTokenReserves: string;

            beforeEach(async function () {
              // Do the first trade.
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .buyUnderlying(this.signers.alice.address, USDC(firstUnderlyingOut));

              // Calculate the amounts necessary for the second trade tests.
              const virtualHTokenReservesBn: BigNumber = await this.contracts.hifiPool.getVirtualHTokenReserves();
              virtualHTokenReserves = div(String(virtualHTokenReservesBn), "1e18");
            });

            const testSets = [["2.141592"], ["9"], ["99"]];

            forEach(testSets).it("buys %e underlying with hTokens", async function (hTokenIn: string) {
              const underlyingReserves: string = sub(lpTokenSupply, firstUnderlyingOut);
              await testBuyUnderlying.call(this, underlyingReserves, virtualHTokenReserves, hTokenIn);
            });

            forEach(testSets).it(
              "buys %e underlying with hTokens and emits a Trade event",
              async function (underlyingOut: string) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .buyUnderlying(this.signers.alice.address, USDC(underlyingOut)),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
