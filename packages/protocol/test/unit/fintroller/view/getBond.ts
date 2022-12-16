import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export function shouldBehaveLikeGetBond(): void {
  context("when the bond is not listed", function () {
    it("returns the default values", async function () {
      const bond = await this.contracts.fintroller.getBond(this.mocks.hTokens[0].address);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(false);
      expect(bond.isDepositUnderlyingAllowed).to.equal(false);
      expect(bond.isLiquidateBorrowAllowed).to.equal(false);
      expect(bond.isListed).to.equal(false);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.mocks.hTokens[0].address);
    });

    it("returns the default values after listing", async function () {
      const bond = await this.contracts.fintroller.getBond(this.mocks.hTokens[0].address);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(true);
      expect(bond.isDepositUnderlyingAllowed).to.equal(true);
      expect(bond.isLiquidateBorrowAllowed).to.equal(true);
      expect(bond.isListed).to.equal(true);
    });
  });
}
