import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetBondCollateralizationRatio(): void {
  context("when the bond is not listed", function () {
    it("retrieves the default values", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.hToken.address);
      expect(bond.collateralizationRatio).to.equal(Zero);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(false);
      expect(bond.isDepositCollateralAllowed).to.equal(false);
      expect(bond.isLiquidateBorrowAllowed).to.equal(false);
      expect(bond.isListed).to.equal(false);
      expect(bond.isRedeemHTokenAllowed).to.equal(false);
      expect(bond.isRepayBorrowAllowed).to.equal(false);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(false);
      expect(bond.liquidationIncentive).to.equal(Zero);
    });
  });

  context("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default values after listing", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.hToken.address);
      expect(bond.collateralizationRatio).to.equal(fintrollerConstants.defaultCollateralizationRatio);
      expect(bond.debtCeiling).to.equal(Zero);
      expect(bond.isBorrowAllowed).to.equal(true);
      expect(bond.isDepositCollateralAllowed).to.equal(true);
      expect(bond.isLiquidateBorrowAllowed).to.equal(true);
      expect(bond.isListed).to.equal(true);
      expect(bond.isRedeemHTokenAllowed).to.equal(true);
      expect(bond.isRepayBorrowAllowed).to.equal(true);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(true);
      expect(bond.liquidationIncentive).to.equal(fintrollerConstants.defaultLiquidationIncentive);
    });
  });
}
