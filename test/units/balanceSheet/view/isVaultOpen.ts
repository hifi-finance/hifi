import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../helpers/errors";

export default function shouldBehaveLikeOpenVault() {
  describe("when the vault is open", function () {
    beforeEach(async function () {
      await this.contracts.balanceSheet.connect(this.signers.brad).openVault(this.stubs.yToken.address);
    });

    it("returns true", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.yToken.address,
        this.accounts.brad,
      );
      expect(isVaultOpen).to.equal(true);
    });
  });

  describe("when the vault is not open", function () {
    it("returns false", async function () {
      const isVaultOpen: boolean = await this.contracts.balanceSheet.isVaultOpen(
        this.stubs.yToken.address,
        this.accounts.brad,
      );
      expect(isVaultOpen).to.equal(false);
    });
  });
}
