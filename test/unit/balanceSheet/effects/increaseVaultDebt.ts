import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeIncreaseVaultDebt(): void {
  const addedDebt: BigNumber = Zero;

  describe("when the caller is not the FyToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.raider)
          .increaseVaultDebt(this.stubs.fyToken.address, this.signers.raider.address, addedDebt),
      ).to.be.revertedWith(BalanceSheetErrors.IncreaseVaultDebtNotAuthorized);
    });
  });
}
