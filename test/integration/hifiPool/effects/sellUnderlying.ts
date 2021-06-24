import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import forEach from "mocha-each";

import { EPSILON, H_TOKEN_MATURITY } from "../../../../helpers/constants";
import { add, div } from "../../../../helpers/math";
import { USDC, bn, hUSDC } from "../../../../helpers/numbers";
import { getLatestBlockTimestamp } from "../../../../helpers/provider";
import { now } from "../../../../helpers/time";
import Errors from "../../../shared/errors";
import { getQuoteForSellingUnderlying } from "../../../shared/mirrors";

async function testSellUnderlying(
  this: Mocha.Context,
  underlyingReserves: string,
  hTokenReserves: string,
  underlyingIn: string,
): Promise<void> {
  // Call the sellUnderlying function and calculate the delta in the hToken balance.
  const preHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const preUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);
  await this.contracts.hifiPool
    .connect(this.signers.alice)
    .sellUnderlying(this.signers.alice.address, USDC(underlyingIn));
  const postHTokenBalance: BigNumber = await this.contracts.hToken.balanceOf(this.signers.alice.address);
  const postUnderlyingBalance: BigNumber = await this.contracts.underlying.balanceOf(this.signers.alice.address);

  const actualHTokenOut: BigNumber = postHTokenBalance.sub(preHTokenBalance);
  const actualUnderlyingIn: BigNumber = preUnderlyingBalance.sub(postUnderlyingBalance);

  // Calculate the expected value of the delta using the local mirror implementation.
  const timeToMaturity: string = String(H_TOKEN_MATURITY.sub(await getLatestBlockTimestamp()));
  const expectedHTokenOut: string = getQuoteForSellingUnderlying(
    underlyingReserves,
    hTokenReserves,
    underlyingIn,
    timeToMaturity,
  );

  // Run the tests.
  expect(hUSDC(expectedHTokenOut).sub(actualHTokenOut).abs()).to.be.lte(EPSILON);
  expect(USDC(underlyingIn)).to.equal(actualUnderlyingIn);
}

export default function shouldBehaveLikeSellUnderlying(): void {
  context("when the amount of underlying to sell is zero", function () {
    it("reverts", async function () {
      const hTokenOut: BigNumber = bn("0");
      await expect(
        this.contracts.hifiPool.connect(this.signers.alice).sellUnderlying(this.signers.alice.address, hTokenOut),
      ).to.be.revertedWith(Errors.SellUnderlyingZero);
    });
  });

  context("when the amount of underlying to sell is not zero", function () {
    context("when the bond matured", function () {
      beforeEach(async function () {
        const oneHourAgo: BigNumber = now().sub(3600);
        await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        const underlyingIn: BigNumber = USDC("10");
        await expect(
          this.contracts.hifiPool.connect(this.signers.alice).sellUnderlying(this.signers.alice.address, underlyingIn),
        ).to.be.revertedWith(Errors.BondMatured);
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
          ).to.be.revertedWith(Errors.HTokenOutForUnderlyingInReservesFactorsUnderflow);
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
            const underlyingIn: BigNumber = USDC("100");
            await expect(
              this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellUnderlying(this.signers.alice.address, underlyingIn),
            ).to.be.revertedWith(Errors.NegativeInterestRate);
          });
        });

        context("when the interest rate does not turn negative", function () {
          const lpTokenSupply: string = initialUnderlyingReserves;

          context("when it is the first trade", function () {
            const testSets = [["3.141592"], ["10"], ["25"]];

            forEach(testSets).it("sells %e underlying for hTokens", async function (underlyingIn: string) {
              const virtualHTokenReserves: string = add(lpTokenSupply, initialHTokenReserves);
              await testSellUnderlying.call(this, initialUnderlyingReserves, virtualHTokenReserves, underlyingIn);
            });
          });

          context("when it is the second trade", function () {
            const firstUnderlyingIn: string = "1";
            let virtualHTokenReserves: string;

            beforeEach(async function () {
              // Do the first trade.
              await this.contracts.hifiPool
                .connect(this.signers.alice)
                .sellUnderlying(this.signers.alice.address, USDC(firstUnderlyingIn));

              // Calculate the amounts necessary for the second trade tests.
              const virtualHTokenReservesBn: BigNumber = await this.contracts.hifiPool.getVirtualHTokenReserves();
              virtualHTokenReserves = div(String(virtualHTokenReservesBn), "1e18");
            });

            const testSets = [["2.141592"], ["9"], ["24"]];

            forEach(testSets).it("sells %e underlying for hTokens", async function (underlyingIn: string) {
              const underlyingReserves: string = add(lpTokenSupply, firstUnderlyingIn);
              await testSellUnderlying.call(this, underlyingReserves, virtualHTokenReserves, underlyingIn);
            });

            forEach(testSets).it(
              "sells %e underlying for hTokens and emits a Trade event",
              async function (underlyingIn: string) {
                await expect(
                  this.contracts.hifiPool
                    .connect(this.signers.alice)
                    .sellUnderlying(this.signers.alice.address, USDC(underlyingIn)),
                ).to.emit(this.contracts.hifiPool, "Trade");
              },
            );
          });
        });
      });
    });
  });
}
