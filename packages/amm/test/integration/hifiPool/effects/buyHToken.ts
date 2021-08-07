import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { H_TOKEN_MATURITY } from "../../../../helpers/constants";
import { add, div, sub } from "../../../../helpers/math";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { getLatestBlockTimestamp } from "../../../../helpers/provider";
import { now } from "../../../../helpers/time";
import { HifiPoolErrors, YieldSpaceErrors } from "../../../shared/errors";
import { getQuoteForBuyingHToken } from "../../../shared/mirrors";

async function testBuyHToken(
  this: Mocha.Context,
  hTokenReserves: string,
  underlyingReserves: string,
  hTokenOut: string,
): Promise<void> {
  // Call the buyHToken function and calculate the delta in the hToken balance.
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
      ).to.be.revertedWith(HifiPoolErrors.BuyHTokenZero);
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
        ).to.be.revertedWith(HifiPoolErrors.BondMatured);
      });
    });

    context("when the bond did not mature", function () {
      context("when there are no hTokens in the pool", function () {
        it("reverts", async function () {
          const hTokenOut: BigNumber = hUSDC("10");
          await expect(
            this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
          ).to.be.revertedWith(YieldSpaceErrors.HTokenReservesUnderflow);
        });
      });

      context("when there are hTokens in the pool", function () {
        const initialHTokenReserves: string = "100";
        const initialUnderlyingReserves: string = "100";

        beforeEach(async function () {
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
            await expect(
              this.contracts.hifiPool.connect(this.signers.alice).buyHToken(this.signers.alice.address, hTokenOut),
            ).to.be.revertedWith(HifiPoolErrors.NegativeInterestRate);
          });
        });

        context("when the interest rate does not turn negative", function () {
          const lpTokenSupply: string = initialUnderlyingReserves;

          context("when it is the first trade", function () {
            const testSets = [["3.141592653589793238"], ["10"], ["25"]];

            forEach(testSets).it("buys %e hTokens with underlying", async function (hTokenOut: string) {
              const virtualHTokenReserves: string = add(lpTokenSupply, initialHTokenReserves);
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
              const normalizedUnderlyingReservesBn: BigNumber =
                await this.contracts.hifiPool.getNormalizedUnderlyingReserves();
              underlyingReserves = div(String(normalizedUnderlyingReservesBn), "1e18");
            });

            const testSets = [["2.141592653589793238"], ["9"], ["24"]];

            forEach(testSets).it("buys %e hTokens with underlying", async function (hTokenOut: string) {
              const virtualHTokenReserves: string = sub(add(lpTokenSupply, initialHTokenReserves), firstHTokenOut);
              await testBuyHToken.call(this, virtualHTokenReserves, underlyingReserves, hTokenOut);
            });

            forEach(testSets).it(
              "buys %e hTokens with underlying and emits a Trade event",
              async function (hTokenOut: string) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .buyHToken(this.signers.alice.address, hUSDC(hTokenOut)),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
