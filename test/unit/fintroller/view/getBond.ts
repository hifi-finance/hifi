import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { percentages } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetBondCollateralizationRatio(): void {
  const newCollateralizationRatioMantissa: BigNumber = percentages.oneHundredAndSeventyFive;

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.listBond(this.stubs.fyToken.address);
      await this.contracts.fintroller.setCollateralizationRatio(
        this.stubs.fyToken.address,
        newCollateralizationRatioMantissa,
      );
    });

    it("retrieves the default values after listing", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.fyToken.address);
      expect(bond.collateralizationRatioMantissa).to.equal(newCollateralizationRatioMantissa);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(true);
      expect(bond.isDepositCollateralAllowed).to.equal(true);
      expect(bond.isLiquidateBorrowAllowed).to.equal(true);
      expect(bond.isListed).to.equal(true);
      expect(bond.isRedeemFyTokenAllowed).to.equal(true);
      expect(bond.isRepayBorrowAllowed).to.equal(true);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(true);
    });
  });

  describe("when the bond is not listed", function () {
    it("retrieves the default values", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.fyToken.address);
      expect(bond.collateralizationRatioMantissa).to.equal(Zero);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(false);
      expect(bond.isDepositCollateralAllowed).to.equal(false);
      expect(bond.isLiquidateBorrowAllowed).to.equal(false);
      expect(bond.isListed).to.equal(false);
      expect(bond.isRedeemFyTokenAllowed).to.equal(false);
      expect(bond.isRepayBorrowAllowed).to.equal(false);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(false);
    });
  });
}
