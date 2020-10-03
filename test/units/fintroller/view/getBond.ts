import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { OnePercentMantissa } from "../../../../utils/constants";

export default function shouldBehaveLikeGetBondThresholdCollateralizationRatio(): void {
  /* Equivalent to 175% */
  const newCollateralizationRatioMantissa: BigNumber = OnePercentMantissa.mul(175);

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.listBond(this.stubs.yToken.address);
      await this.contracts.fintroller.setCollateralizationRatio(
        this.stubs.yToken.address,
        newCollateralizationRatioMantissa,
      );
    });

    it("retrieves all the storage properties of the bond", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.yToken.address);
      expect(bond.isBorrowAllowed).to.equal(false);
      expect(bond.isDepositCollateralAllowed).to.equal(false);
      expect(bond.isListed).to.equal(true);
      expect(bond.isRedeemUnderlyingAllowed).to.equal(false);
      expect(bond.isRepayBorrowAllowed).to.equal(false);
      expect(bond.isSupplyUnderlyingAllowed).to.equal(false);
      expect(bond.thresholdCollateralizationRatioMantissa).to.equal(newCollateralizationRatioMantissa);
    });
  });

  describe("when the bond is not listed", function () {
    it("retrieves a non-listed bond", async function () {
      const bond = await this.contracts.fintroller.getBond(this.stubs.yToken.address);
      expect(bond.isListed).to.equal(false);
    });
  });
}
