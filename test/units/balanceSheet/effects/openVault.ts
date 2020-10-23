import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeOpenVault(): void {
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
      it("reverts", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.borrower).openVault(AddressZero)).to.be.reverted;
      });
    });

    describe("when the fyToken is compliant", function () {
      it("opens the vault", async function () {
        await this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address);
      });

      it("emits an OpenVault event", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.borrower).openVault(this.stubs.fyToken.address))
          .to.emit(this.contracts.balanceSheet, "OpenVault")
          .withArgs(this.stubs.fyToken.address, this.accounts.borrower);
      });
    });
  });
}
