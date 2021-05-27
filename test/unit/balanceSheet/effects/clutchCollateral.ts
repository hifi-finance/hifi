import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import fp from "evm-fp";

import { BalanceSheetErrors } from "../../../../helpers/errors";

export default function shouldBehaveLikeClutchCollateral(): void {
  const collateralAmount: BigNumber = fp("50");

  context("when the caller is not the HToken contract", function () {
    it("reverts", async function () {
      await expect(
        this.contracts.balanceSheet
          .connect(this.signers.admin)
          .clutchCollateral(
            this.stubs.hToken.address,
            this.signers.liquidator.address,
            this.signers.borrower.address,
            collateralAmount,
          ),
      ).to.be.revertedWith(BalanceSheetErrors.ClutchCollateralNotAuthorized);
    });
  });
}
