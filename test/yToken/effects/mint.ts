import { BigNumber } from "@ethersproject/bignumber";
import { Wallet } from "@ethersproject/wallet";
import { expect } from "chai";

import { FintrollerErrors, YTokenErrors } from "../../errors";
import { OneHundredTokens, TenTokens } from "../../../constants";
import { setNextBlockTimestamp } from "../../helpers";

export default function shouldBehaveLikeMint(admin: Wallet, bob: Wallet, _eve: Wallet): void {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.yToken.connect(bob).openVault();
    });

    describe("when the bond is listed", function () {
      beforeEach(async function () {
        await this.fintroller.connect(admin)._listBond(this.yToken.address);
      });

      describe("when the fintroller allows new mints", function () {
        beforeEach(async function () {
          await this.fintroller.connect(admin)._setMintAllowed(this.yToken.address, true);
        });

        describe("when the bond did not mature", function () {
          beforeEach(async function () {
            await this.fintroller.connect(admin)._setDepositAllowed(this.yToken.address, true);
          });

          describe("when the user deposited collateral and locked it", function () {
            beforeEach(async function () {
              await this.collateral.connect(bob).approve(this.yToken.address, TenTokens);
              await this.yToken.connect(bob).depositCollateral(TenTokens);
              await this.yToken.connect(bob).lockCollateral(TenTokens);
            });

            it("mints new yTokens", async function () {
              await this.yToken.connect(bob).mint(OneHundredTokens);
            });

            it("increases the erc20 balance of the caller", async function () {
              const callerAddress: string = await bob.getAddress();
              const preBalance: BigNumber = await this.yToken.balanceOf(callerAddress);
              await this.yToken.connect(bob).mint(OneHundredTokens);
              const postBalance: BigNumber = await this.yToken.balanceOf(callerAddress);
              expect(preBalance).to.equal(postBalance.sub(OneHundredTokens));
            });

            it("emits a Mint event", async function () {
              await expect(this.yToken.connect(bob).mint(OneHundredTokens))
                .to.emit(this.yToken, "Mint")
                .withArgs(await bob.getAddress(), OneHundredTokens);
            });

            it("emits a Transfer event", async function () {
              await expect(this.yToken.connect(bob).mint(OneHundredTokens))
                .to.emit(this.yToken, "Transfer")
                .withArgs(this.yToken.address, await bob.getAddress(), OneHundredTokens);
            });
          });

          describe("when the user deposited collateral but did not lock it", function () {
            beforeEach(async function () {
              await this.collateral.connect(bob).approve(this.yToken.address, TenTokens);
              await this.yToken.connect(bob).depositCollateral(TenTokens);
            });

            it("reverts", async function () {
              await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(
                YTokenErrors.MintInsufficientLockedCollateral,
              );
            });
          });

          describe("when the user did not deposit any collateral", function () {
            it("reverts", async function () {
              await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(
                YTokenErrors.MintInsufficientLockedCollateral,
              );
            });
          });
        });

        describe("when the bond matured", function () {
          beforeEach(async function () {
            /* TODO: ensure that this doesn't mess up all test cases after it */
            await setNextBlockTimestamp(this.scenario.yToken.expirationTime);
          });

          it("reverts", async function () {
            await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.BondMatured);
          });
        });
      });

      describe("when the fintroller does not allow new mints", function () {
        it("reverts", async function () {
          await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.MintNotAllowed);
        });
      });
    });

    describe("when the bond is not listed", function () {
      it("reverts", async function () {
        await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(
          FintrollerErrors.BondNotListed,
        );
      });
    });
  });

  describe("when the vault is not open", function () {
    it("reverts", async function () {
      await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.VaultNotOpen);
    });
  });
}
