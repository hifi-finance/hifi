import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { GenericErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeOpenVault(): void {
  describe("when the vault is not open", function () {
    describe("when the yToken is compliant", function () {
      it("opens the vault", async function () {
        await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
      });

      it("emits an OpenVault event", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address))
          .to.emit(this.contracts.balanceSheet, "OpenVault")
          .withArgs(this.stubs.yToken.address, this.accounts.brad);
      });
    });

    describe("when the yToken is not compliant", function () {
      it("reverts", async function () {
        await expect(this.contracts.balanceSheet.connect(this.signers.brad).openVault(AddressZero)).to.be.reverted;
      });
    });
  });

  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address),
      ).to.be.revertedWith(GenericErrors.VaultOpen);
    });
  });
}
