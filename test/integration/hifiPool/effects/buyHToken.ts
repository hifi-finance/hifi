import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";
import forEach from "mocha-each";

import { H_TOKEN_MATURITY, MAX_UD60x18, PI } from "../../../../helpers/constants";
import { mbn } from "../../../../helpers/math";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { getLatestBlockTimestamp } from "../../../../helpers/provider";
import { now } from "../../../../helpers/time";
import Errors from "../../../shared/errors";
import { getQuoteForBuyingHToken } from "../../../shared/mirrors";

async function testBuyHToken(
  this: Mocha.Context,
  hTokenReserves: string,
  underlyingReserves: string,
  hTokenOut: string,
): Promise<void> {
  // Call the buyUnderlying function and calculate the delta in the hToken balance.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hUSDC(hTokenOut));
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);

  const actualHTokenOut: BigNumber = postHTokenBalance.sub(preHTokenBalance);
  const actualUnderlyingIn: BigNumber = preUnderlyingBalance.sub(postUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: string = String(H_TOKEN_MATURITY.sub(await getLatestBlockTimestamp()));
  const expectedUnderlyingIn: string = getQuoteForBuyingHToken(
    hTokenReserves,
    underlyingReserves,
    hTokenOut,
    timeToMaturity,
  );

  // Run the tests.
  expect(hUSDC(hTokenOut)).to.equal(actualHTokenOut);
  expect(USDC(expectedUnderlyingIn)).to.equal(actualUnderlyingIn);
}

export default function shouldBehaveLikeBuyHToken(): void {
  context("when the amount of hTokens to buy is zero", function () {
    it("reverts", async function () {
      const hTokenOut: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
      ).to.be.revertedWith(Errors.BuyHTokenZero);
    });
  });

  context("when the amount of hTokens to buy is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = now().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const hTokenOut: BigNumber = hUSDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
        ).to.be.revertedWith(Errors.BondMatured);
      });
    });

    context("when the bond did not mature", function () {
      context("when there are no hTokens in the pool", function () {
        it("reverts", async function () {
          const hTokenOut: BigNumber = hUSDC("10");
          await expect(
            this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
          ).to.be.revertedWith(Errors.HTokenReservesUnderflow);
        });
      });

      context("when there are hTokens in the pool", function () {
        const initialHTokenReserves: string = "100";
        const initialUnderlyingReserves: string = "100";
        const lpTokenSupply: string = initialUnderlyingReserves;

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

          // Initialize the pool.
          await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(initialUnderlyingReserves));

          // Transfer hTokens to the pool.
          await this.contracts.hToken
            .connect(this.signers.alice)
            .transfer(this.contracts.hifiPool.address, hUSDC(initialHTokenReserves));
        });

        context("when the interest rate turns negative", function () {
          it("reverts", async function () {
            const hTokenOut: BigNumber = hUSDC("100");
            await expect(this.contracts.hifiPool.buyHToken(this.signers.alice.address, hTokenOut)).to.be.revertedWith(
              Errors.NegativeInterestRate,
            );
          });
        });

        context("when the interest rate does not turn negative", function () {
          context("when it is the first trade", function () {
            const testSets = [[PI], ["10"], ["50"]];

            forEach(testSets).it("buys %e hTokens with underlying", async function (hTokenOut: string) {
              const virtualHTokenReserves: string = String(mbn(lpTokenSupply).add(mbn(initialHTokenReserves)));
              await testBuyHToken.call(this, virtualHTokenReserves, initialUnderlyingReserves, hTokenOut);
            });
          });

          context("when it is the second trade", function () {
            const firstHTokenOut: string = "1";
            let underlyingReserves: string;

            beforeEach(async function () {
              // Do the first trade.
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .buyHToken(this.signers.alice.address, hUSDC(firstHTokenOut));

              // Calculate the amounts necessary for the second trade tests.
              const normalizedUnderlyingReserves: string = String(
                await this.contracts.hifiPool.getNormalizedUnderlyingReserves(),
              );
              underlyingReserves = String(mbn(normalizedUnderlyingReserves).div("1e18"));
            });

            const testSets = [["2.141592653589793238"], ["9"], ["49"]];

            forEach(testSets).it("buys %e hTokens with underlying", async function (hTokenOut: string) {
              const virtualHTokenReserves: string = String(
                mbn(lpTokenSupply).add(mbn(initialHTokenReserves)).sub(mbn(firstHTokenOut)),
              );
              await testBuyHToken.call(this, virtualHTokenReserves, underlyingReserves, hTokenOut);
            });

            forEach(testSets).it(
              "buys %e hTokens with underlying and emits a Trade event",
              async function (underlyingOut: string) {
                // Test argument equality when Waffle adds "withNamedArgs" chai matcher.
                // https://github.com/EthWorks/Waffle/issues/437
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
