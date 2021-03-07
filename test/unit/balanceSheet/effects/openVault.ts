import { expect } from "chai";

import { BalanceSheetErrors, GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeOpenVault(): void {
  describe("when the bond is not listed", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.fyToken.address).returns(false);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address),
      ).to.be.revertedWith(GenericErrors.BondNotListed);
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.stubs.fintroller.mock.isBondListed.withArgs(this.stubs.fyToken.address).returns(true);
    });

    describe("when the vault is open", function () {
      beforeEach(async function () {
        await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
      });

      it("reverts", async function () {
        await expect(
          this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address),
        ).to.be.revertedWith(GenericErrors.VaultOpen);
      });
    });

    describe("when the vault is not open", function () {
      describe("when the fyToken is not compliant", function () {
        beforeEach(async function () {
          await this.stubs.fyToken.mock.isFyToken.returns(false);
        });

        it("reverts", async function () {
          await expect(
            this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address),
          ).to.be.revertedWith(BalanceSheetErrors.OpenVaultFyTokenInspection);
        });
      });

      describe("when the fyToken is compliant", function () {
        it("opens the vault", async function () {
          await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
        });

        it("emits an OpenVault event", async function () {
          await expect(this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address))
            .to.emit(this.contracts.balanceSheet, "OpenVault")
            .withArgs(this.stubs.fyToken.address, this.signers.borrower.address);
        });
      });
    });
  });
}
