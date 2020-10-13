import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { BalanceSheetErrors } from "../../../utils/errors";
import { TokenAmounts } from "../../../utils/constants";

export default function shouldBehaveLikeClutchCollateral(): void {
  const collateralAmount: BigNumber = TokenAmounts.Fifty;

  describe("when the caller is not the yToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.admin)
          .clutchCollateral(this.stubs.yToken.address, this.accounts.grace, this.accounts.brad, collateralAmount),
      ).to.be.revertedWith(BalanceSheetErrors.ClutchCollateralNotAuthorized);
    });
  });
}
