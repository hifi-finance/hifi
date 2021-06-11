import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetBondCollateralizationRatio(): void {
  context("when the bond is not listed", function () {
    it("retrieves the default values", async function () {
      const bond = await this.contracts.fintroller.getBond(this.mocks.hTokens[0].address);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(false);
      expect(bond.isLiquidateBorrowAllowed).to.equal(false);
      expect(bond.isListed).to.equal(false);
      expect(bond.isRedeemHTokenAllowed).to.equal(false);
      expect(bond.isRepayBorrowAllowed).to.equal(false);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(false);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.owner).listBond(this.mocks.hTokens[0].address);
    });

    it("retrieves the default values after listing", async function () {
      const bond = await this.contracts.fintroller.getBond(this.mocks.hTokens[0].address);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(true);
      expect(bond.isLiquidateBorrowAllowed).to.equal(true);
      expect(bond.isListed).to.equal(true);
      expect(bond.isRedeemHTokenAllowed).to.equal(true);
      expect(bond.isRepayBorrowAllowed).to.equal(true);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(true);
    });
  });
}
