import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const debt: BigNumber = Zero;

  describe("when the caller is not the fyToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.raider)
          .setVaultDebt(this.stubs.fyToken.address, this.accounts.raider, debt),
      ).to.be.revertedWith(BalanceSheetErrors.SetVaultDebtNotAuthorized);
    });
  });
}
