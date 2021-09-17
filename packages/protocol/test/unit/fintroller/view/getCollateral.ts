import { Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS, LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetCollateral(): void {
  context("when the collateral is not listed", function () {
    it("returns the default values", async function () {
      const collateral = await this.contracts.fintroller.getCollateral(this.mocks.wbtc.address);
      expect(collateral.ceiling).to.equal(Zero);
      expect(collateral.liquidationIncentive).to.equal(Zero);
      expect(collateral.isDepositCollateralAllowed).to.equal(false);
      expect(collateral.isListed).to.equal(false);
      expect(collateral.ratio).to.equal(Zero);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("returns the default values after listing", async function () {
      const collateral = await this.contracts.fintroller.getCollateral(this.mocks.wbtc.address);
      expect(collateral.ceiling).to.equal(Zero);
      expect(collateral.liquidationIncentive).to.equal(LIQUIDATION_INCENTIVES.default);
      expect(collateral.isDepositCollateralAllowed).to.equal(true);
      expect(collateral.isListed).to.equal(true);
      expect(collateral.ratio).to.equal(COLLATERAL_RATIOS.default);
    });
  });
}
