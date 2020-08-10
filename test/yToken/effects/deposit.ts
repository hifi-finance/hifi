import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../errors";
import { TenTokens } from "../../../constants";

export default function shouldBehaveLikeDeposit(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(admin)._listBond(this.yToken.address);
      });

      describe("when the fintroller allows new deposits", function () {
        beforeEach(async function () {
          await this.fintroller.connect(admin)._setDepositAllowed(this.yToken.address, true);
        });

        describe("when the yToken contract has enough allowance", function () {
          beforeEach(async function () {
            await this.collateral.connect(bob).approve(this.yToken.address, TenTokens);
          });

          it("makes the deposit", async function () {
            await this.yToken.connect(bob).deposit(TenTokens);
          });

          it("changes the erc20 balance of the caller", async function () {
            const callerAddress: string = await bob.getAddress();
            const preBalance: BigNumber = await this.collateral.balanceOf(callerAddress);
            await this.yToken.connect(bob).deposit(TenTokens);
            const postBalance: BigNumber = await this.collateral.balanceOf(callerAddress);
            expect(preBalance).to.equal(postBalance.add(TenTokens));
          });

          it("emits a DepositCollateral event", async function () {
            await expect(this.yToken.connect(bob).deposit(TenTokens))
              .to.emit(this.yToken, "DepositCollateral")
              .withArgs(await bob.getAddress(), TenTokens);
          });
        });

        describe("when the yToken contract does not have enough allowance", function () {
          it("reverts", async function () {
            await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.reverted;
          });
        });
      });

      describe("when the fintroller does not allow new deposits", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(YTokenErrors.DepositNotAllowed);
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(FintrollerErrors.BondNotListed);
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(bob).deposit(TenTokens)).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
