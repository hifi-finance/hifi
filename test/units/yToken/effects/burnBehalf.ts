import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants, OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { YTokenErrors } from "../../../helpers/errors";
import { contextForBradDepositingTenTokensAsCollateral } from "../../../helpers/mochaContexts";

/**
 * This test suite assumes that Lucy pays the debt on behalf of Brad.
 */
export default function shouldBehaveLikeBurnBehalf(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the amount to burn is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.getBond
            .withArgs(this.contracts.yToken.address)
            .returns(FintrollerConstants.DefaultCollateralizationRatioMantissa);
        });

        describe("when the fintroller allow burns", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.burnAllowed.withArgs(this.contracts.yToken.address).returns(true);
          });

          contextForBradDepositingTenTokensAsCollateral("when the user has a debt", function () {
            beforeEach(async function () {
              /* Brads mints 100 yDAI. */
              await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
              await this.stubs.fintroller.mock.mintAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens);

              /* And sends it all to Lucy. */
              await this.contracts.yToken.connect(this.signers.brad).transfer(this.accounts.lucy, OneHundredTokens);
            });

            it("burns the yTokens", async function () {
              const preBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              await this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens);
              const postBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.lucy);
              expect(preBalance).to.equal(postBalance.add(OneHundredTokens));
            });

            it("emits a Burn event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens),
              )
                .to.emit(this.contracts.yToken, "Burn")
                .withArgs(this.accounts.brad, OneHundredTokens);
            });

            it("emits a BurnBehalf event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens),
              )
                .to.emit(this.contracts.yToken, "BurnBehalf")
                .withArgs(this.accounts.lucy, this.accounts.brad, OneHundredTokens);
            });

            it("emits a Transfer event", async function () {
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens),
              )
                .to.emit(this.contracts.yToken, "Transfer")
                .withArgs(this.accounts.lucy, this.contracts.yToken.address, OneHundredTokens);
            });
          });

          describe("when the user does not have a debt", function () {
            beforeEach(async function () {
              /* Lucy deposits 10 WETH as collateral. */
              await this.contracts.yToken.connect(this.signers.lucy).openVault();
              await this.stubs.fintroller.mock.depositCollateralAllowed
                .withArgs(this.contracts.yToken.address)
                .returns(true);
              await this.stubs.collateral.mock.transferFrom
                .withArgs(this.accounts.lucy, this.contracts.yToken.address, TenTokens)
                .returns(true);
              await this.contracts.yToken.connect(this.signers.lucy).depositCollateral(TenTokens);
              await this.contracts.yToken.connect(this.signers.lucy).lockCollateral(TenTokens);

              /* Lucy mints 100 yDAI. */
              await this.stubs.fintroller.mock.mintAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.contracts.yToken.connect(this.signers.lucy).mint(OneHundredTokens);
            });

            it("reverts", async function () {
              /* Lucy tries to burn her debt on behalf of Brad but fails to do so. */
              await expect(
                this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens),
              ).to.be.revertedWith(YTokenErrors.BurnInsufficientDebt);
            });
          });
        });

        describe("when the fintroller does not allow burns", function () {
          beforeEach(async function () {
            await this.stubs.fintroller.mock.burnAllowed.withArgs(this.contracts.yToken.address).returns(false);
          });

          it("reverts", async function () {
            await expect(
              this.contracts.yToken.connect(this.signers.brad).burnBehalf(this.accounts.brad, OneHundredTokens),
            ).to.be.revertedWith(YTokenErrors.BurnNotAllowed);
          });
        });
      });
    });

    describe("when the amount to burn is zero", function () {
      it("reverts", async function () {
        await expect(
          this.contracts.yToken.connect(this.signers.brad).burnBehalf(this.accounts.brad, Zero),
        ).to.be.revertedWith(YTokenErrors.BurnZero);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.yToken.connect(this.signers.lucy).burnBehalf(this.accounts.brad, OneHundredTokens),
      ).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
