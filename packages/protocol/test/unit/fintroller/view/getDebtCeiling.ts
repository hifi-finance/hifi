import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export function shouldBehaveLikeGetDebtCeiling(): void {
  context("when the bond is not listed", function () {
    it("returns zero", async function () {
      const debtCeiling: BigNumber = await this.contracts.fintroller.getDebtCeiling(this.mocks.hTokens[0].address);
      expect(debtCeiling).to.equal(Zero);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
    });

    it("returns the default debt ceiling", async function () {
      const debtCeiling: BigNumber = await this.contracts.fintroller.getDebtCeiling(this.mocks.hTokens[0].address);
      expect(debtCeiling).to.equal(Zero);
    });
  });
}
