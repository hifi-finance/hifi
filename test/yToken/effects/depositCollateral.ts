import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../../dev-utils/errors";
import { TenTokens } from "../../../dev-utils/constants";
import { contextForTimeDependentTests } from "../../../dev-utils/mochaContexts";

export default function shouldBehaveLikeDepositCollateral(): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(this.brad).openVault();
    });

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
            const callerAddress: string = await this.brad.getAddress();
            const preBalance: BigNumber = await this.collateral.balanceOf(callerAddress);
            await this.yToken.connect(this.brad).depositCollateral(TenTokens);
            const postBalance: BigNumber = await this.collateral.balanceOf(callerAddress);
            expect(preBalance).to.equal(postBalance.add(TenTokens));
          });

          it("emits a DepositCollateral event", async function () {
            await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens))
              .to.emit(this.yToken, "DepositCollateral")
              .withArgs(await this.brad.getAddress(), TenTokens);
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
            YTokenErrors.DepositNotAllowed,
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

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(this.brad).depositCollateral(TenTokens)).to.be.revertedWith(
        YTokenErrors.VaultNotOpen,
      );
    });
  });
}
