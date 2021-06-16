import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { WBTC } from "../../../../helpers/numbers";

export default function shouldBehaveLikeGetCollateralAmount(): void {
  context("when the caller did not deposit collateral", function () {
    it("returns zero", async function () {
      const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
        this.signers.borrower.address,
        this.mocks.wbtc.address,
      );
      expect(collateralAmount).to.equal(Zero);
    });
  });

  context("when the caller deposited collateral", function () {
    const depositAmount: BigNumber = WBTC("1");

    beforeEach(async function () {
      await this.contracts.balanceSheet.__godMode_setCollateralAmount(
        this.signers.borrower.address,
        this.mocks.wbtc.address,
        depositAmount,
      );
    });

    it("returns the correct value", async function () {
      const collateralAmount: BigNumber = await this.contracts.balanceSheet.getCollateralAmount(
        this.signers.borrower.address,
        this.mocks.wbtc.address,
      );
      expect(collateralAmount).to.equal(depositAmount);
    });
  });
}
