import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../../helpers/errors";
import { TokenAmounts } from "../../../../helpers/constants";

export default function shouldBehaveLikeClutchCollateral(): void {
  const collateralAmount: BigNumber = TokenAmounts.Fifty;

  describe("when the caller is not the yToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.admin)
          .clutchCollateral(
            this.stubs.yToken.address,
            this.accounts.liquidator,
            this.accounts.borrower,
            collateralAmount,
          ),
      ).to.be.revertedWith(BalanceSheetErrors.ClutchCollateralNotAuthorized);
    });
  });
}
