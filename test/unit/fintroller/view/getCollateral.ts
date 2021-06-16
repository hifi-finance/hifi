import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { DEFAULT_COLLATERALIZATION_RATIO, DEFAULT_LIQUIDATION_INCENTIVE } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetCollateral(): void {
  context("when the collateral is not listed", function () {
    it("retrieves the default values", async function () {
      const collateral = await this.contracts.fintroller.getCollateral(this.mocks.wbtc.address);
      expect(collateral.collateralizationRatio).to.equal(Zero);
      expect(collateral.liquidationIncentive).to.equal(Zero);
      expect(collateral.isDepositCollateralAllowed).to.equal(false);
      expect(collateral.isListed).to.equal(false);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves the default values after listing", async function () {
      const collateral = await this.contracts.fintroller.getCollateral(this.mocks.wbtc.address);
      expect(collateral.collateralizationRatio).to.equal(DEFAULT_COLLATERALIZATION_RATIO);
      expect(collateral.liquidationIncentive).to.equal(DEFAULT_LIQUIDATION_INCENTIVE);
      expect(collateral.isDepositCollateralAllowed).to.equal(true);
      expect(collateral.isListed).to.equal(true);
    });
  });
}
