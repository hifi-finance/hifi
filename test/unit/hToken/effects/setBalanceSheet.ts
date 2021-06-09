import { AddressZero } from "@ethersproject/constants";
import { expect } from "chai";
import { MockContract } from "ethereum-waffle";

import { AdminErrors } from "../../../shared/errors";
import { deployMockBalanceSheet } from "../../../shared/mocks";

export default function shouldBehaveLikeSetBalanceSheet(): void {
  context("when the caller is not the admin", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.hTokens[0].connect(this.signers.raider)._setBalanceSheet(AddressZero),
      ).to.be.revertedWith(AdminErrors.NotAdmin);
    });
  });

  context("when the caller is the admin", function () {
    let newBalanceSheet: MockContract;

    beforeEach(async function () {
      newBalanceSheet = await deployMockBalanceSheet(this.signers.admin);
    });

    it("sets the new BalanceSheet", async function () {
      await this.contracts.hTokens[0].connect(this.signers.admin)._setBalanceSheet(newBalanceSheet.address);
      const newBalanceSheetAddress: string = await this.contracts.hTokens[0].balanceSheet();
      expect(newBalanceSheet.address).to.equal(newBalanceSheetAddress);
    });
  });
}
