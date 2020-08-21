import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../../helpers/errors";
import { OneHundredTokens, TenTokens } from "../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../helpers/mochaContexts";
import { increaseTime } from "../../../helpers/jsonRpcHelpers";

export default function shouldBehaveLikeMint(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.yToken.connect(this.signers.brad).openVault();
    });

    describe("when the amount to mint is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.stubs.fintroller.connect(this.signers.admin).listBond(this.contracts.yToken.address);
        });

        describe("when the bond did not mature", function () {
          describe("when the fintroller allows new mints", function () {
            beforeEach(async function () {
              await this.stubs.fintroller
                .connect(this.signers.admin)
                .setMintAllowed(this.contracts.yToken.address, true);
              await this.stubs.fintroller
                .connect(this.signers.admin)
                .setDepositAllowed(this.contracts.yToken.address, true);
            });

            /**
             * Write tests for the following cases:
             * - collateral value too small
             * - not enough liquidity in the guarantor pool
             */
            describe("when the user deposited collateral", function () {
              beforeEach(async function () {
                await this.stubs.collateral
                  .connect(this.signers.brad)
                  .approve(this.contracts.yToken.address, TenTokens);
                await this.contracts.yToken.connect(this.signers.brad).depositCollateral(TenTokens);
              });

              describe("and locked it", function () {
                beforeEach(async function () {
                  await this.contracts.yToken.connect(this.signers.brad).lockCollateral(TenTokens);
                });

                it("mints new yTokens", async function () {
                  await this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens);
                });

                it("emits a Mint event", async function () {
                  await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens))
                    .to.emit(this.contracts.yToken, "Mint")
                    .withArgs(this.accounts.brad, OneHundredTokens);
                });

                it("emits a Transfer event", async function () {
                  await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens))
                    .to.emit(this.contracts.yToken, "Transfer")
                    .withArgs(this.contracts.yToken.address, this.accounts.brad, OneHundredTokens);
                });
              });

              describe("but did not lock it", function () {
                it("reverts", async function () {
                  await expect(
                    this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens),
                  ).to.be.revertedWith(YTokenErrors.BelowCollateralizationRatio);
                });
              });
            });

            describe("when the user did not deposit any collateral", function () {
              it("reverts", async function () {
                await expect(
                  this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens),
                ).to.be.revertedWith(YTokenErrors.BelowCollateralizationRatio);
              });
            });
          });

          describe("when the fintroller does not allow new mints", function () {
            it("reverts", async function () {
              await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens)).to.be.revertedWith(
                YTokenErrors.MintNotAllowed,
              );
            });
          });
        });

        contextForTimeDependentTests("when the bond matured", function () {
          beforeEach(async function () {
            await increaseTime(this.scenario.yToken.expirationTime);
          });

          it("reverts", async function () {
            await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens)).to.be.revertedWith(
              YTokenErrors.BondMatured,
            );
          });
        });
      });

      describe("when the bond is not listed", function () {
        it("reverts", async function () {
          await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens)).to.be.revertedWith(
            FintrollerErrors.BondNotListed,
          );
        });
      });
    });

    describe("when the amount to mint is zero", function () {
      it("reverts", async function () {
        await expect(this.contracts.yToken.connect(this.signers.brad).mint(Zero)).to.be.revertedWith(
          YTokenErrors.MintZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.contracts.yToken.connect(this.signers.brad).mint(OneHundredTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
