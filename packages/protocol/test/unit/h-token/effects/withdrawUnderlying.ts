import type { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { HTokenErrors } from "@hifi/errors";
import { USDC, getNow } from "@hifi/helpers";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { toBn } from "evm-bn";
import forEach from "mocha-each";

export function shouldBehaveLikeWithdrawUnderlying(): void {
  let depositor: SignerWithAddress;

  beforeEach(async function () {
    depositor = this.signers.maker;
  });

  context("when the amount of underlying to withdraw is zero", function () {
    it("reverts", async function () {
      const depositUnderlyingAmount: BigNumber = Zero;
      await expect(
        this.contracts.hTokens[0].connect(depositor).withdrawUnderlying(depositUnderlyingAmount),
      ).to.be.revertedWith(HTokenErrors.WITHDRAW_UNDERLYING_ZERO);
    });
  });

  context("when the amount of underlying to withdraw is not zero", function () {
    context("when the bond matured", function () {
      const underlyingAmount: BigNumber = USDC("100");

      beforeEach(async function () {
        const oneHourAgo: BigNumber = getNow().sub(3600);
        await this.contracts.hTokens[0].__godMode_setMaturity(oneHourAgo);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.hTokens[0].connect(depositor).withdrawUnderlying(underlyingAmount),
        ).to.be.revertedWith(HTokenErrors.BOND_MATURED);
      });
    });

    context("when the bond did not mature", function () {
      const underlyingAmount: BigNumber = USDC("100");

      context("when the depositor does not have enough underlying", function () {
        it("reverts", async function () {
          await expect(
            this.contracts.hTokens[0].connect(depositor).withdrawUnderlying(underlyingAmount),
          ).to.be.revertedWith(HTokenErrors.WITHDRAW_UNDERLYING_UNDERFLOW);
        });
      });

      context("when the depositor has enough underlying", function () {
        const testSets: number[] = [18, 6, 1];

        forEach(testSets).describe("when the underlying has %d decimals", function (decimals: number) {
          const underlyingAmount: BigNumber = toBn("100", decimals);

          beforeEach(async function () {
            // Mock the necessary methods.
            await this.contracts.hTokens[0].__godMode_setUnderlyingPrecisionScalar(decimals);
            await this.mocks.fintroller.mock.getDepositUnderlyingAllowed
              .withArgs(this.contracts.hTokens[0].address)
              .returns(true);
            await this.mocks.usdc.mock.transferFrom
              .withArgs(depositor.address, this.contracts.hTokens[0].address, underlyingAmount)
              .returns(true);
            await this.mocks.usdc.mock.transfer.withArgs(depositor.address, underlyingAmount).returns(true);

            // Make the underlying deposit.
            await this.contracts.hTokens[0].connect(depositor).depositUnderlying(underlyingAmount);
          });

          it("decreases the depositor balance", async function () {
            const oldDepositorBalance: BigNumber = await this.contracts.hTokens[0].getDepositorBalance(
              depositor.address,
            );
            await this.contracts.hTokens[0].connect(depositor).withdrawUnderlying(underlyingAmount);
            const newDepositorBalance: BigNumber = await this.contracts.hTokens[0].getDepositorBalance(
              depositor.address,
            );
            expect(oldDepositorBalance).to.equal(newDepositorBalance.add(underlyingAmount));
          });

          it("decreases the underlying reserve", async function () {
            const oldUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
            await this.contracts.hTokens[0].connect(depositor).withdrawUnderlying(underlyingAmount);
            const newUnderlyingReserve: BigNumber = await this.contracts.hTokens[0].totalUnderlyingReserve();
            expect(oldUnderlyingReserve).to.equal(newUnderlyingReserve.add(underlyingAmount));
          });
        });
      });
    });
  });
}
