import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants } from "../../../helpers/constants";
import { FintrollerErrors, YTokenErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeDepositCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the amount to deposit is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.contracts.yToken.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
        });

        describe("when the fintroller allows new deposits", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.depositAllowed.withArgs(this.contracts.yToken.address).returns(true);
          });

          describe("when the yToken contract has enough allowance", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
                .returns(true);
            });

            it("makes the collateral deposit", async function () {
              await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
            });

            it("emits a DepositCollateral event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens))
                .to.emit(this.contracts.yToken, "DepositCollateral")
                .withArgs(this.accounts.brad, TenTokens);
            });
          });

          describe("when the yToken contract does not have enough allowance", function () {
            beforeEach(async function () {
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
                .returns(false);
            });

            it("reverts", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens)).to.be
                .reverted;
            });
          });
        });

        describe("when the fintroller does not allow new deposits", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.depositAllowed.withArgs(this.contracts.yToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens),
            ).to.be.revertedWith(YTokenErrors.DepositCollateralNotAllowed);
          });
        });
      });

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.depositAllowed
            .withArgs(this.contracts.yToken.address)
            .reverts(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          /* TODO: Replace with FintrollerErrors.BondNotListed */
          await expect(
            this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens),
          ).to.be.revertedWith("Mock revert");
        });
      });
    });

    describe("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).depositCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.DepositCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
