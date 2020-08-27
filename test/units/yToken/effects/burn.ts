import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants } from "../../../helpers/constants";
// import { FintrollerErrors } from "../../../helpers/errors";
import { OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { YTokenErrors } from "../../../helpers/errors";
// import { contextForTimeDependentTests } from "../../../helpers/mochaContexts";
// import { increaseTime } from "../../../helpers/jsonRpcHelpers";

export default function shouldBehaveLikeBurn(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the amount to burn is not zero", function () {
      describe("when the fintroller allow burns", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.burnAllowed.withArgs(this.contracts.yToken.address).returns(true);
        });

        describe("when the user deposited collateral", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.getBond
              .withArgs(this.contracts.yToken.address)
              .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
            await this.stubs.fintroller.mock.depositAllowed.withArgs(this.contracts.yToken.address).returns(true);
            await this.stubs.collateral.mock.transferFrom
              .withArgs(this.accounts.brad, this.contracts.yToken.address, TenTokens)
              .returns(true);
            await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
          });
        });

        describe("when the user did not deposit any collateral", function () {
          beforeEach(async function () {
            await this.stubs.collateral.mock.balanceOf.withArgs(this.accounts.brad).returns(Zero);
          });

          it("reverts", async function () {
            await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens)).to.be.revertedWith(
              YTokenErrors.BurnInsufficientBalance,
            );
          });
        });
      });

      describe("when the fintroller does not allow burns", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.burnAllowed.withArgs(this.contracts.yToken.address).returns(false);
        });

        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens)).to.be.revertedWith(
            YTokenErrors.BurnNotAllowed,
          );
        });
      });
    });

    describe("when the amount to burn is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).burn(Zero)).to.be.revertedWith(
          YTokenErrors.BurnZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
