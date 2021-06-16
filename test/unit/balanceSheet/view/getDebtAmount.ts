import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { hUSDC } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetDebtAmount(): void {
  context("when the caller did not make a borrow", function () {
    it("returns zero", async function () {
      const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
        this.signers.borrower.address,
        this.mocks.hTokens[0].address,
      );
      expect(debtAmount).to.equal(Zero);
    });
  });

  context("when the caller made a borrow", function () {
    const borrowAmount: BigNumber = hUSDC("15000");

    beforeEach(async function () {
      await this.contracts.balanceSheet.__godMode_setDebtAmount(
        this.signers.borrower.address,
        this.mocks.hTokens[0].address,
        borrowAmount,
      );
    });

    it("returns the correct value", async function () {
      const debtAmount: BigNumber = await this.contracts.balanceSheet.getDebtAmount(
        this.signers.borrower.address,
        this.mocks.hTokens[0].address,
      );
      expect(debtAmount).to.equal(borrowAmount);
    });
  });
}
