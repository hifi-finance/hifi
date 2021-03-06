import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { H_TOKEN_MATURITY_ONE_YEAR } from "@hifi/constants";
import { HifiPoolErrors } from "@hifi/errors";
import { USDC, getNow, hUSDC } from "@hifi/helpers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

export function shouldBehaveLikeMint(): void {
  context("when the bond matured", function () {
    beforeEach(async function () {
      const oneHourAgo: BigNumber = getNow().sub(3600);
      await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setMaturity(oneHourAgo);
    });

    it("reverts", async function () {
      const underlyingOffered: BigNumber = Zero;
      await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(underlyingOffered)).to.be.revertedWith(
        HifiPoolErrors.BOND_MATURED,
      );
    });
  });

  context("when the bond did not mature", function () {
    context("when the underlying offered is 0", function () {
      it("reverts", async function () {
        const underlyingOffered: BigNumber = Zero;
        await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(underlyingOffered)).to.be.revertedWith(
          HifiPoolErrors.MINT_ZERO,
        );
      });
    });

    context("when the underlying offered is not 0", function () {
      context("when the total supply is 0", function () {
        const testSets = [
          "1e-6",
          "100",
          "1729",
          "31415.92",
          "115792089237316195423570985008687907853269984665640564039457.584007",
        ];

        forEach(testSets).it("takes %e and mints the LP tokens", async function (underlyingOffered: string) {
          await this.mocks.underlying.mock.transferFrom
            .withArgs(this.signers.alice.address, this.contracts.hifiPool.address, USDC(underlyingOffered))
            .returns(true);

          const underlyingAmount: BigNumber = USDC(underlyingOffered);
          const hTokenRequired: BigNumber = Zero;
          const poolTokensMinted: BigNumber = toBn(underlyingOffered);

          await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(underlyingOffered)))
            .to.emit(this.contracts.hifiPool, "AddLiquidity")
            .withArgs(
              H_TOKEN_MATURITY_ONE_YEAR,
              this.signers.alice.address,
              underlyingAmount,
              hTokenRequired,
              poolTokensMinted,
            );
        });
      });

      context("when the total supply is not 0", function () {
        const initialNormalizedUnderlyingDeposit: BigNumber = toBn("100");
        const initialLpTokenSupply: BigNumber = toBn("100");
        const initialUnderlyingDeposit: BigNumber = USDC("100");

        beforeEach(async function () {
          await this.mocks.underlying.mock.balanceOf
            .withArgs(this.contracts.hifiPool.address)
            .returns(initialUnderlyingDeposit);
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_mint(initialLpTokenSupply);
          await this.contracts.hifiPool.connect(this.signers.alice).__godMode_setTotalSupply(initialLpTokenSupply);
        });

        context("when there is phantom overflow", function () {
          const testSets = [
            // Makes "supply * normalizedUnderlyingOffered" overflow.
            [Zero, USDC("1157920892373161954235709850086879078532.699847")],
            // Makes "hTokenReserves * poolTokensMinted" overflow.
            [hUSDC("1157920892373161954235709850086879078532.699846656405640395"), USDC("100")],
          ];

          forEach(testSets).it(
            "takes %e and %e and reverts",
            async function (hTokenBalance: BigNumber, underlyingOffered: BigNumber) {
              await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(hTokenBalance);
              await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(underlyingOffered)).to.be.reverted;
            },
          );
        });

        context("when there is no phantom overflow", function () {
          context("when there are no hToken reserves", function () {
            beforeEach(async function () {
              await this.mocks.hToken.mock.balanceOf.withArgs(this.contracts.hifiPool.address).returns(Zero);
            });

            const testSets = [
              "1e-6",
              "100",
              "1729",
              "31415.92",
              "1157920892373161954235709850086879078532.699846", // First number for which "poolTokensMinted" does not overflow
            ];

            forEach(testSets).it("takes %e and mints the LP tokens", async function (underlyingOffered: string) {
              // Calculate the arguments emitted in the event.
              const underlyingAmount: BigNumber = USDC(underlyingOffered);
              const hTokenRequired: BigNumber = Zero;
              const poolTokensMinted: BigNumber = initialLpTokenSupply
                .mul(toBn(underlyingOffered))
                .div(initialNormalizedUnderlyingDeposit);

              // Mock the necessary methods.
              await this.mocks.underlying.mock.transferFrom
                .withArgs(this.signers.alice.address, this.contracts.hifiPool.address, underlyingAmount)
                .returns(true);

              // Mint
              await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(underlyingOffered)))
                .to.emit(this.contracts.hifiPool, "AddLiquidity")
                .withArgs(
                  H_TOKEN_MATURITY_ONE_YEAR,
                  this.signers.alice.address,
                  underlyingAmount,
                  hTokenRequired,
                  poolTokensMinted,
                );
            });
          });

          context("when there are hToken reserves", function () {
            const initialHTokenReserves: BigNumber = hUSDC("100");
            beforeEach(async function () {
              await this.mocks.hToken.mock.balanceOf
                .withArgs(this.contracts.hifiPool.address)
                .returns(initialHTokenReserves);
            });

            const testSets = [
              "1e-6",
              "100",
              "1729",
              "31415.92",
              "1157920892373161954235709850086879078532.699846", // First number for which "poolTokensMinted" does not overflow
            ];

            forEach(testSets).it("takes %e and mints the LP tokens", async function (underlyingOffered: string) {
              // Calculate the arguments emitted in the event.
              const underlyingAmount: BigNumber = USDC(underlyingOffered);
              const poolTokensMinted: BigNumber = initialLpTokenSupply
                .mul(toBn(underlyingOffered))
                .div(initialNormalizedUnderlyingDeposit);
              const hTokenRequired: BigNumber = initialHTokenReserves.mul(poolTokensMinted).div(initialLpTokenSupply);

              // Mock the necessary methods.
              await this.mocks.underlying.mock.transferFrom
                .withArgs(this.signers.alice.address, this.contracts.hifiPool.address, underlyingAmount)
                .returns(true);
              await this.mocks.hToken.mock.transferFrom
                .withArgs(this.signers.alice.address, this.contracts.hifiPool.address, hTokenRequired)
                .returns(true);

              // Mint
              await expect(this.contracts.hifiPool.connect(this.signers.alice).mint(USDC(underlyingOffered)))
                .to.emit(this.contracts.hifiPool, "AddLiquidity")
                .withArgs(
                  H_TOKEN_MATURITY_ONE_YEAR,
                  this.signers.alice.address,
                  underlyingAmount,
                  hTokenRequired,
                  poolTokensMinted,
                );
            });
          });
        });
      });
    });
  });
}
