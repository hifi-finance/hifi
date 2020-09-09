import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors, FintrollerErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";
import { stubGetBond } from "../../../helpers/stubs";

export default function shouldBehaveLikeDepositCollateral(): void {
  const collateralAmount: BigNumber = TenTokens;

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    describe("when the amount to deposit is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await stubGetBond.call(this, this.stubs.yToken.address);
        });

        describe("when the fintroller allows deposit", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.depositCollateralAllowed.withArgs(this.stubs.yToken.address).returns(true);
          });

          describe("when the yToken contract has enough allowance", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, collateralAmount)
                .returns(true);
            });

            it("makes the collateral deposit", async function () {
              await this.contracts.balanceSheet
                .connect(this.signers.brad)
                .depositCollateral(this.stubs.yToken.address, collateralAmount);
            });

            it("emits a DepositCollateral event", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .depositCollateral(this.stubs.yToken.address, collateralAmount),
              )
                .to.emit(this.contracts.balanceSheet, "DepositCollateral")
                .withArgs(this.stubs.yToken.address, this.accounts.brad, collateralAmount);
            });
          });

          describe("when the yToken contract does not have enough allowance", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.brad, this.contracts.balanceSheet.address, collateralAmount)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(
                this.contracts.balanceSheet
                  .connect(this.signers.brad)
                  .depositCollateral(this.stubs.yToken.address, collateralAmount),
              ).to.be.reverted;
            });
          });
        });

        describe("when the fintroller does not allow deposit", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.depositCollateralAllowed
              .withArgs(this.stubs.yToken.address)
              .returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.balanceSheet
                .connect(this.signers.brad)
                .depositCollateral(this.stubs.yToken.address, collateralAmount),
            ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralNotAllowed);
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.depositCollateralAllowed
            .withArgs(this.stubs.yToken.address)
            .revertsWithReason(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet
              .connect(this.signers.brad)
              .depositCollateral(this.stubs.yToken.address, collateralAmount),
          ).to.be.revertedWith(FintrollerErrors.BondNotListed);
        });
      });
    });

    describe("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        const zeroCollateralAmount: BigNumber = Zero;
        await expect(
          this.contracts.balanceSheet
            .connect(this.signers.brad)
            .depositCollateral(this.stubs.yToken.address, zeroCollateralAmount),
        ).to.be.revertedWith(BalanceSheetErrors.DepositCollateralZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.brad)
          .depositCollateral(this.stubs.yToken.address, collateralAmount),
      ).to.be.revertedWith(BalanceSheetErrors.VaultNotOpen);
    });
  });
}
