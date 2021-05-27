import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";

import { fintrollerConstants } from "../../../../helpers/constants";
import { price } from "../../../../helpers/numbers";

export default function shouldBehaveLikeIsAccountUnderwater(): void {
  context("when the vault is not open", function () {
    it("retrieves false", async function () {
      const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
        this.stubs.hToken.address,
        this.signers.borrower.address,
      );
      expect(isAccountUnderwater).to.equal(false);
    });
  });

  context("when the vault is open", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.hToken.address).returns(true);
      await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.hToken.address);
    });

    context("when the debt is zero", function () {
      it("retrieves false", async function () {
        const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
          this.stubs.hToken.address,
          this.signers.borrower.address,
        );
        expect(isAccountUnderwater).to.equal(false);
      });
    });

    context("when the debt is non-zero", function () {
      const debt: BigNumber = fp("100");
      const lockedCollateral: BigNumber = fp("10");

      beforeEach(async function () {
        await this.stubs.fintroller.mock.getBondCollateralizationRatio
          .withArgs(this.stubs.hToken.address)
          .returns(fintrollerConstants.defaultCollateralizationRatio);
        await this.contracts.balanceSheet.__godMode_setVaultLockedCollateral(
          this.stubs.hToken.address,
          this.signers.borrower.address,
          lockedCollateral,
        );
        await this.contracts.balanceSheet.__godMode_setVaultDebt(
          this.stubs.hToken.address,
          this.signers.borrower.address,
          debt,
        );
      });

      context("when the user is safely collateralized", function () {
        // Recall that the default oracle price for 1 WETH is $100.
        it("retrieves false", async function () {
          const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
            this.stubs.hToken.address,
            this.signers.borrower.address,
          );
          expect(isAccountUnderwater).to.equal(false);
        });
      });

      context("when the user is dangerously collateralized", function () {
        beforeEach(async function () {
          await this.stubs.oracle.mock.getAdjustedPrice.withArgs("WETH").returns(price("12"));
        });

        // The price of 1 WETH is $12 so the new collateralization ratio becomes 120%.
        it("retrieves true", async function () {
          const isAccountUnderwater: boolean = await this.contracts.balanceSheet.isAccountUnderwater(
            this.stubs.hToken.address,
            this.signers.borrower.address,
          );
          expect(isAccountUnderwater).to.equal(true);
        });
      });
    });
  });
}
