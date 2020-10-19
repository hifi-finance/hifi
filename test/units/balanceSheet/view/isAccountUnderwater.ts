import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { FintrollerConstants, Prices, TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeIsAccountUnderwater(): void {
  describe("when the vault is not open", function () {
    it("retrieves false", async function () {
      const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
        this.stubs.yToken.address,
        this.accounts.borrower,
      );
      expect(isAccountUnderwater).to.equal(false);
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.yToken.address);
    });

    describe("when the debt is zero", function () {
      it("retrieves false", async function () {
        const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
          this.stubs.yToken.address,
          this.accounts.borrower,
        );
        expect(isAccountUnderwater).to.equal(false);
      });
    });

    describe("when the debt is non-zero", function () {
      const debt: BigNumber = TokenAmounts.OneHundred;
      const lockedCollateral: BigNumber = TokenAmounts.Ten;

      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondCollateralizationRatio
          .withArgs(this.stubs.yToken.address)
          .returns(FintrollerConstants.DefaultBond.CollateralizationRatio);
        await this.contracts.balanceSheet.__godMode_setVaultLockedCollateral(
          this.stubs.yToken.address,
          this.accounts.borrower,
          lockedCollateral,
        );
        await this.contracts.balanceSheet.__godMode_setVaultDebt(
          this.stubs.yToken.address,
          this.accounts.borrower,
          debt,
        );
      });

      describe("when the user is safely collateralized", function () {
        /* Recall that the default oracle price for 1 WETH is $100. */
        it("retrieves false", async function () {
          const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
            this.stubs.yToken.address,
            this.accounts.borrower,
          );
          expect(isAccountUnderwater).to.equal(false);
        });
      });

      describe("when the user is dangerously collateralized", function () {
        beforeEach(async function () {
          const collateralSymbol = await this.stubs.collateral.symbol();
          await this.stubs.oracle.mock.price.withArgs(collateralSymbol).returns(Prices.TwelveDollars);
        });

        /* The price of 1 WETH is $12 so the new collateralization ratio becomes 120%. */
        it("retrieves true", async function () {
          const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
            this.stubs.yToken.address,
            this.accounts.borrower,
          );
          expect(isAccountUnderwater).to.equal(true);
        });
      });
    });
  });
}
