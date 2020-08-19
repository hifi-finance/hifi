import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../../helpers/errors";
import { OneToken, TenTokens, OneHundredTokens } from "../../../helpers/constants";

export default function shouldBehaveLikeLockCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(this.brad).openVault();
    });

    describe("when the user deposited collateral", function () {
      beforeEach(async function () {
        await this.fintroller.connect(this.admin).listBond(this.yToken.address);
        await this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true);
        await this.collateral.connect(this.brad).approve(this.yToken.address, TenTokens);
        await this.yToken.connect(this.brad).depositCollateral(TenTokens);
      });

      describe("and locked it", function () {
        beforeEach(async function () {
          await this.yToken.connect(this.brad).lockCollateral(TenTokens);
        });

        describe("when the user has a debt", function () {
          beforeEach(async function () {
            await this.fintroller.connect(this.admin).setMintAllowed(this.yToken.address, true);
          });

          describe("and is safely over-collateralized", async function () {
            beforeEach(async function () {
              await this.yToken.connect(this.brad).mint(OneHundredTokens);
            });

            it("it frees the collateral", async function () {
              const preVault = await this.yToken.getVault(this.bradAddress);
              await this.yToken.connect(this.brad).freeCollateral(OneToken);
              const postVault = await this.yToken.getVault(this.bradAddress);
              expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(OneToken));
              expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(OneToken));
            });

            it("emits a FreeCollateral event", async function () {
              await expect(this.yToken.connect(this.brad).freeCollateral(OneToken))
                .to.emit(this.yToken, "FreeCollateral")
                .withArgs(this.bradAddress, OneToken);
            });
          });

          describe("and is dangerously collateralized", function () {
            beforeEach(async function () {
              /* This is 150%. Remember that we deposited 10 ETH and that the oracle assumes 1 ETH = $100. */
              const mintAmount: BigNumber = OneToken.mul(666);
              await this.yToken.connect(this.brad).mint(mintAmount);
            });

            it("reverts", async function () {
              await expect(this.yToken.connect(this.brad).freeCollateral(OneToken)).to.be.revertedWith(
                YTokenErrors.BelowCollateralizationRatio,
              );
            });
          });
        });

        describe("when the user does not have a debt", function () {
          it("it frees the collateral", async function () {
            const preVault = await this.yToken.getVault(this.bradAddress);
            await this.yToken.connect(this.brad).freeCollateral(TenTokens);
            const postVault = await this.yToken.getVault(this.bradAddress);
            expect(preVault.freeCollateral).to.equal(postVault.freeCollateral.sub(TenTokens));
            expect(preVault.lockedCollateral).to.equal(postVault.lockedCollateral.add(TenTokens));
          });

          it("emits a FreeCollateral event", async function () {
            await expect(this.yToken.connect(this.brad).freeCollateral(TenTokens))
              .to.emit(this.yToken, "FreeCollateral")
              .withArgs(this.bradAddress, TenTokens);
          });
        });
      });

      describe("but did not lock it", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(this.brad).freeCollateral(TenTokens)).to.be.revertedWith(
            YTokenErrors.FreeCollateralInsufficientLockedCollateral,
          );
        });
      });
    });

    describe("when the user did not deposit any collateral", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(this.brad).freeCollateral(TenTokens)).to.be.revertedWith(
          YTokenErrors.FreeCollateralInsufficientLockedCollateral,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(this.brad).freeCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
