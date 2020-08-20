import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { YTokenErrors } from "../../../helpers/errors";
import { TenTokens } from "../../../helpers/constants";

export default function shouldBehaveLikewithdrawCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(this.brad).openVault();
    });

    describe("when the amount to withdraw is not zero", function () {
      describe("when the user deposited collateral", function () {
        beforeEach(async function () {
          await this.fintroller.connect(this.admin).listBond(this.yToken.address);
          await this.fintroller.connect(this.admin).setDepositAllowed(this.yToken.address, true);
          await this.collateral.connect(this.brad).approve(this.yToken.address, TenTokens);
          await this.yToken.connect(this.brad).depositCollateral(TenTokens);
        });

        describe("and did not lock it", function () {
          it("makes the collateral withdrawal", async function () {
            await this.yToken.connect(this.brad).withdrawCollateral(TenTokens);
          });

          it("increases the erc20 balance of the caller", async function () {
            const preBalance: BigNumber = await this.collateral.balanceOf(this.bradAddress);
            await this.yToken.connect(this.brad).withdrawCollateral(TenTokens);
            const postBalance: BigNumber = await this.collateral.balanceOf(this.bradAddress);
            expect(preBalance).to.equal(postBalance.sub(TenTokens));
          });

          it("emits a WithdrawCollateral event", async function () {
            await expect(this.yToken.connect(this.brad).withdrawCollateral(TenTokens))
              .to.emit(this.yToken, "WithdrawCollateral")
              .withArgs(this.bradAddress, TenTokens);
          });
        });

        describe("and locked it", function () {
          beforeEach(async function () {
            await this.yToken.connect(this.brad).lockCollateral(TenTokens);
          });

          it("reverts", async function () {
            await expect(this.yToken.connect(this.brad).withdrawCollateral(TenTokens)).to.be.revertedWith(
              YTokenErrors.WithdrawCollateralInsufficientFreeCollateral,
            );
          });
        });
      });

      describe("when the user did not deposit any collateral", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(this.brad).withdrawCollateral(TenTokens)).to.be.revertedWith(
            YTokenErrors.WithdrawCollateralInsufficientFreeCollateral,
          );
        });
      });
    });

    describe("when the amount to withdraw is zero", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(this.brad).withdrawCollateral(Zero)).to.be.revertedWith(
          YTokenErrors.WithdrawCollateralZero,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(this.brad).withdrawCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
