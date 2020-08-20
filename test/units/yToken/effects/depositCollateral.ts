import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";
import { contextForTimeDependentTests } from "../../../helpers/mochaContexts";

export default function shouldBehaveLikeDepositCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(this.brad).openVault();
    });

    describe("when the amount to deposit is not zero", function () {
      describe("when the bond is listed", function () {
        beforeEach(async function () {
          await this.fintroller.connect(this.admin).listBond(this.yToken.address);
        });

        describe("when the fintroller allows new deposits", function () {
          beforeEach(async function () {
            await this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true);
          });

          describe("when the yToken contract has enough allowance", function () {
            beforeEach(async function () {
              await this.collateral.connect(this.brad).approve(this.yToken.address, TenTokens);
            });

            it("makes the collateral deposit", async function () {
              await this.yToken.connect(this.brad).depositCollateral(TenTokens);
            });

            it("decreases the erc20 balance of the caller", async function () {
              const preBalance: BigNumber = await this.collateral.balanceOf(this.bradAddress);
              await this.yToken.connect(this.brad).depositCollateral(TenTokens);
              const postBalance: BigNumber = await this.collateral.balanceOf(this.bradAddress);
              expect(preBalance).to.equal(postBalance.add(TenTokens));
            });

            it("emits a DepositCollateral event", async function () {
              await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens))
                .to.emit(this.yToken, "DepositCollateral")
                .withArgs(this.bradAddress, TenTokens);
            });
          });

          describe("when the yToken contract does not have enough allowance", function () {
            it("reverts", async function () {
              await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens)).to.be.reverted;
            });
          });
        });

        describe("when the fintroller does not allow new deposits", function () {
          it("reverts", async function () {
            await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens)).to.be.revertedWith(
              YTokenErrors.DepositCollateralNotAllowed,
            );
          });
        });
      });

      describe("when the bond is not listed", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens)).to.be.revertedWith(
            FintrollerErrors.BondNotListed,
          );
        });
      });
    });

    describe("when the amount to deposit is zero", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(this.brad).depositCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.DepositCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
