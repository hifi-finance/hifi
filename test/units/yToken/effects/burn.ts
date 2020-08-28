import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerConstants } from "../../../helpers/constants";
import { FintrollerErrors } from "../../../helpers/errors";
import { OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { YTokenErrors } from "../../../helpers/errors";
import { contextForBradDepositingTenTokensAsCollateral } from "../../../helpers/mochaContexts";

export default function shouldBehaveLikeBurn(): void {
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
              await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
              await this.stubs.fintroller.mock.mintAllowed.withArgs(this.contracts.yToken.address).returns(true);
              await this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens);
            });

            it("burns the yTokens", async function () {
              const preBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
              await this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens);
              const postBalance: BigNumber = await this.contracts.yToken.balanceOf(this.accounts.brad);
              expect(preBalance).to.equal(postBalance.add(OneHundredTokens));
            });

            it("emits a Burn event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens))
                .to.emit(this.contracts.yToken, "Burn")
                .withArgs(this.accounts.brad, OneHundredTokens);
            });

            it("emits a Transfer event", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens))
                .to.emit(this.contracts.yToken, "Transfer")
                .withArgs(this.accounts.brad, this.contracts.yToken.address, OneHundredTokens);
            });
          });

          describe("when the user does not have a debt", function () {
            contextForBradDepositingTenTokensAsCollateral("when the user owns yTokens", function () {
              it("reverts", async function () {
                /* Brads mints 100 yDAI and sends it all to Lucy. */
                await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
                await this.stubs.fintroller.mock.mintAllowed.withArgs(this.contracts.yToken.address).returns(true);
                await this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens);
                await this.contracts.yToken.connect(this.signers.brad).transfer(this.accounts.lucy, OneHundredTokens);

                /* Lucy tries to burn the 100 yDAI but fails to do so because she doesn't have any debt. */
                await this.contracts.yToken.connect(this.signers.lucy).openVault();
                await expect(
                  this.contracts.yToken.connect(this.signers.lucy).burn(OneHundredTokens),
                ).to.be.revertedWith(YTokenErrors.BurnInsufficientDebt);
              });
            });

            describe("when the user does not own any yTokens", function () {
              beforeEach(async function () {
                await this.stubs.collateral.mock.balanceOf.withArgs(this.accounts.brad).returns(Zero);
              });

              it("reverts", async function () {
                await expect(
                  this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens),
                ).to.be.revertedWith(YTokenErrors.BurnInsufficientBalance);
              });
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

      describe("when the bond is not listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.mock.burnAllowed
            .withArgs(this.contracts.yToken.address)
            .reverts(FintrollerErrors.BondNotListed);
        });

        it("reverts", async function () {
          /* TODO: Replace with FintrollerErrors.BondNotListed */
          await expect(this.contracts.yToken.connect(this.signers.brad).burn(OneHundredTokens)).to.be.revertedWith(
            "Mock revert",
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
