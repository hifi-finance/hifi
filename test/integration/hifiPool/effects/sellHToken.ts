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
import { getQuoteForSellingHToken } from "../../../shared/mirrors";

async function testSellHToken(
  this: Mocha.Context,
  hTokenReserves: string,
  underlyingReserves: string,
  hTokenIn: string,
): Promise<void> {
  // Call the sellHToken function and calculate the delta in the token balances.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hUSDC(hTokenIn));
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);

  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const actualUnderlyingOut: BigNumber = postUnderlyingBalance.sub(preUnderlyingBalance);
  const actualHTokenIn: BigNumber = preHTokenBalance.sub(postHTokenBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: string = String(H_TOKEN_MATURITY.sub(await getLatestBlockTimestamp()));
  const expectedUnderlyingOut: string = getQuoteForSellingHToken(
    hTokenReserves,
    underlyingReserves,
    hTokenIn,
    timeToMaturity,
  );

  // Run the tests.
  expect(hUSDC(hTokenIn)).to.equal(actualHTokenIn);
  expect(USDC(expectedUnderlyingOut)).to.equal(actualUnderlyingOut);
}

export default function shouldBehaveLikeSellHToken(): void {
  context("when the amount of hTokens to sell is zero", function () {
    it("reverts", async function () {
      const hTokenIn: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
      ).to.be.revertedWith(Errors.SellHTokenZero);
    });
  });

  context("when the amount of hTokens to sell is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = now().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const hTokenIn: BigNumber = hUSDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
        ).to.be.revertedWith(Errors.BondMatured);
      });
    });

    context("when the bond did not mature", function () {
      context("when there is no underlying in the pool", function () {
        it("reverts", async function () {
          const hTokenIn: BigNumber = hUSDC("10");
          await expect(
            this.contracts.hifiPool.connect(this.signers.alice).sellHToken(this.signers.alice.address, hTokenIn),
          ).to.be.revertedWith(Errors.UnderlyingOutForHTokenInReservesFactorsUnderflow);
        });
      });

      context("when there is underlying in the pool", function () {
        const initialUnderlyingReserves: string = "100";

        beforeEach(async function () {
          // Mint an infinite amount of hTokens and underlying.
          await this.contracts.hToken.mint(this.signers.alice.address, fp(MAX_UD60x18));
          await this.contracts.underlying.mint(this.signers.alice.address, fp(MAX_UD60x18));

          // Approve the pool to spend hTokens.
          await this.contracts.hToken
            .connect(this.signers.alice)
            .approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));
          await this.contracts.underlying
            .connect(this.signers.alice)
            .approve(this.contracts.hifiPool.address, fp(MAX_UD60x18));

          // Initialize the pool.
          await this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(initialUnderlyingReserves));
        });

        context("when liquidity was provided once", function () {
          const testSets = [[PI], ["10"], ["100"]];

          forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: string) {
            const virtualHTokenReserves: string = initialUnderlyingReserves;
            await testSellHToken.call(this, virtualHTokenReserves, initialUnderlyingReserves, hTokenIn);
          });
        });

        context("when liquidity was provided twice or more times", function () {
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
              const virtualHTokenReserves: string = lpTokenSupply;
              const underlyingReserves: string = lpTokenSupply;
              await testSellHToken.call(this, virtualHTokenReserves, underlyingReserves, hTokenIn);
            });
          });

          context("when it is the second trade", function () {
            const firstHTokenIn: string = "1";
            let underlyingReserves: string;
            let virtualHTokenReserves: string;

            beforeEach(async function () {
              // Do the first trade.
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellHToken(this.signers.alice.address, hUSDC(firstHTokenIn));

              // Calculate the amounts necessary for the second trade tests.
              const normalizedUnderlyingReserves: string = String(
                await this.contracts.hifiPool.getNormalizedUnderlyingReserves(),
              );
              underlyingReserves = String(mbn(normalizedUnderlyingReserves).div("1e18"));
            });

            const testSets = [["2.141592653589793238"], ["9"], ["99"]];

            forEach(testSets).it("sells %e hTokens for underlying", async function (hTokenIn: string) {
              virtualHTokenReserves = String(mbn(lpTokenSupply).add(firstHTokenIn));
              await testSellHToken.call(this, virtualHTokenReserves, underlyingReserves, hTokenIn);
            });

            forEach(testSets).it(
              "sells %e hTokens for underlying and emits a Trade event",
              async function (hTokenIn: string) {
                // Test argument equality when Waffle adds "withNamedArgs" chai matcher.
                // https://github.com/EthWorks/Waffle/issues/437
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .sellHToken(this.signers.alice.address, hUSDC(hTokenIn)),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
