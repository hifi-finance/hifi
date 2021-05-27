import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeIncreaseVaultDebt(): void {
  const addedDebt: BigNumber = Zero;

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.raider)
          .increaseVaultDebt(this.stubs.hToken.address, this.signers.raider.address, addedDebt),
      ).to.be.revertedWith(BalanceSheetErrors.IncreaseVaultDebtNotAuthorized);
    });
  });
}
