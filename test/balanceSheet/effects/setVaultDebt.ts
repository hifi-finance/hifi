import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../utils/errors";

export default function shouldBehaveLikeSetVaultDebt(): void {
  const debt: BigNumber = Zero;

  describe("when the caller is not the yToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.eve)
          .setVaultDebt(this.stubs.yToken.address, this.accounts.eve, debt),
      ).to.be.revertedWith(BalanceSheetErrors.SetVaultDebtNotAuthorized);
    });
  });
}
