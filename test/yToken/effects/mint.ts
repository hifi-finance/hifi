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

        describe("when the yToken did not mature", function () {
          describe("when the user has enough free collateral", function () {
            beforeEach(async function () {
              await this.fintroller.connect(admin)._setDepositAllowed(this.yToken.address, true);
              await this.collateral.connect(bob).approve(this.yToken.address, TenTokens);
              await this.yToken.connect(bob).deposit(TenTokens);
            });

            describe("when the yToken contract has enough underlying allowance", function () {
              beforeEach(async function () {
                await this.underlying.connect(bob).approve(this.yToken.address, TenTokens);
              });

              it("mints new yTokens", async function () {
                await this.yToken.connect(bob).mint(OneHundredTokens);
              });
            });

            describe("when the yToken contract does not have enough underlying allowance", function () {
              it.skip("reverts", async function () {
                await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith("Lol");
              });
            });
          });

          describe("when the user does not have enough free collateral", function () {
            it.skip("reverts", async function () {
              await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(
                YTokenErrors.FreeCollateralInsufficient,
              );
            });
          });
        });

        describe("when the yToken matured", function () {
          beforeEach(async function () {
            await setNextBlockTimestamp(this.scenario.yToken.expirationTime);
          });

          it("reverts", async function () {
            await expect(this.yToken.connect(bob).mint(OneHundredTokens)).to.be.revertedWith(YTokenErrors.Matured);
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
