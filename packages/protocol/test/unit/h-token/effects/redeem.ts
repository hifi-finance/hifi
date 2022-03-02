import type { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { HTokenErrors } from "@hifi/errors";
import { getNow } from "@hifi/helpers";
import { getPrecisionScalar, hUSDC } from "@hifi/helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

export function shouldBehaveLikeRedeem(): void {
  let maker: SignerWithAddress;

  beforeEach(async function () {
    maker = this.signers.maker;
  });

  context("when the bond did not mature", function () {
    it("reverts", async function () {
      await expect(this.contracts.hTokens[0].connect(maker).redeem(Zero)).to.be.revertedWith(
        HTokenErrors.BOND_NOT_MATURED,
      );
    });
  });

  context("when the bond matured", function () {
    beforeEach(async function () {
      const oneHourAgo: BigNumber = getNow().sub(3600);
      await this.contracts.hTokens[0].__godMode_setMaturity(oneHourAgo);
    });

    context("when the amount to redeem is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.hTokens[0].connect(maker).redeem(Zero)).to.be.revertedWith(
          HTokenErrors.REDEEM_ZERO,
        );
      });
    });

    context("when the amount to redeem is not zero", function () {
      const underlyingAmount: BigNumber = toBn("100", 18);

      context("when there is not enough liquidity", function () {
        it("reverts", async function () {
          await expect(this.contracts.hTokens[0].connect(maker).redeem(underlyingAmount)).to.be.revertedWith(
            HTokenErrors.REDEEM_INSUFFICIENT_LIQUIDITY,
          );
        });
      });

      context("when there is enough liquidity", function () {
        beforeEach(async function () {
          await this.contracts.hTokens[0].__godMode_mint(maker.address, underlyingAmount);
          const totalUnderlyingReserve: BigNumber = toBn("1e6", 18);
          await this.contracts.hTokens[0].__godMode_setTotalUnderlyingReserve(totalUnderlyingReserve);
        });

        const testSets: number[] = [18, 6, 1];
        forEach(testSets).describe("when the underlying has %d decimals", function (decimals: number) {
          const underlyingAmount: BigNumber = toBn("100", decimals);

          beforeEach(async function () {
            await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(getPrecisionScalar(decimals));
            await this.mocks.usdc.mock.transfer.withArgs(maker.address, underlyingAmount).returns(true);
          });

          it("makes the redemption", async function () {
            const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
            await this.contracts.hTokens[0].connect(maker).redeem(underlyingAmount);
            const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
            expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
          });

          it("emits a Redeem event", async function () {
            const hTokenAmount = hUSDC("100");
            await expect(this.contracts.hTokens[0].connect(maker).redeem(underlyingAmount))
              .to.emit(this.contracts.hTokens[0], "Redeem")
              .withArgs(maker.address, underlyingAmount, hTokenAmount);
          });
        });
      });
    });
  });
}
