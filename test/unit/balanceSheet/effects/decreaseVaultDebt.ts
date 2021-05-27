import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeDecreaseVaultDebt(): void {
  const subtractedDebt: BigNumber = Zero;

  describe("when the caller is not the FyToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.raider)
          .decreaseVaultDebt(this.stubs.fyToken.address, this.signers.raider.address, subtractedDebt),
      ).to.be.revertedWith(BalanceSheetErrors.DecreaseVaultDebtNotAuthorized);
    });
  });
}
