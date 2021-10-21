import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { HTokenErrors } from "@hifi/errors";
import { getNow } from "@hifi/helpers";
import { getPrecisionScalar, hUSDC } from "@hifi/helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { toBn } from "evm-bn";

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
      context("when the calculated underlying amount is zero", function () {
        it("reverts", async function () {
          const tinyHTokenAmount: BigNumber = hUSDC("1e-7");
          await expect(this.contracts.hTokens[0].connect(maker).redeem(tinyHTokenAmount)).to.be.revertedWith(
            HTokenErrors.REDEEM_UNDERLYING_ZERO,
          );
        });
      });

      context("when the calculated underlying amount is not zero", function () {
        const hTokenAmount: BigNumber = hUSDC("100");

        context("when there is not enough liquidity", function () {
          it("reverts", async function () {
            await expect(this.contracts.hTokens[0].connect(maker).redeem(hTokenAmount)).to.be.revertedWith(
              HTokenErrors.REDEEM_INSUFFICIENT_LIQUIDITY,
            );
          });
        });

        context("when there is enough liquidity", function () {
          beforeEach(async function () {
            await this.contracts.hTokens[0].__godMode_mint(maker.address, hTokenAmount);
            const totalUnderlyingReserve: BigNumber = toBn("1e6", 18);
            await this.contracts.hTokens[0].__godMode_setTotalUnderlyingReserve(totalUnderlyingReserve);
          });

          context("when the underlying has 18 decimals", function () {
            const localUnderlyingAmount: BigNumber = toBn("100", 18);

            beforeEach(async function () {
              await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(1);
              await this.mocks.usdc.mock.transfer.withArgs(maker.address, localUnderlyingAmount).returns(true);
            });

            it("makes the redemption", async function () {
              const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              await this.contracts.hTokens[0].connect(maker).redeem(hTokenAmount);
              const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(localUnderlyingAmount));
            });
          });

          context("when the underlying has 6 decimals", function () {
            const underlyingAmount: BigNumber = toBn("100", 6);

            beforeEach(async function () {
              await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(getPrecisionScalar(6));
              await this.mocks.usdc.mock.transfer.withArgs(maker.address, underlyingAmount).returns(true);
            });

            it("makes the redemption", async function () {
              const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              await this.contracts.hTokens[0].connect(maker).redeem(hTokenAmount);
              const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
            });
          });

          context("when the underlying has 1 decimal", function () {
            const underlyingAmount: BigNumber = toBn("100", 1);

            beforeEach(async function () {
              await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(getPrecisionScalar(1));
              await this.mocks.usdc.mock.transfer.withArgs(maker.address, underlyingAmount).returns(true);
            });

            it("makes the redemption", async function () {
              const oldUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              await this.contracts.hTokens[0].connect(maker).redeem(hTokenAmount);
              const newUnderlyingTotalSupply: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
              expect(oldUnderlyingTotalSupply).to.equal(newUnderlyingTotalSupply.add(underlyingAmount));
            });

            it("emits a Redeem event", async function () {
              await expect(this.contracts.hTokens[0].connect(maker).redeem(hTokenAmount))
                .to.emit(this.contracts.hTokens[0], "Redeem")
                .withArgs(maker.address, hTokenAmount, underlyingAmount);
            });
          });
        });
      });
    });
  });
}
