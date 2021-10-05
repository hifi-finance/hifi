import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { COLLATERAL_RATIOS } from "@hifi/constants";
import { expect } from "chai";

export function shouldBehaveLikeGetCollateralRatio(): void {
  context("when the collateral is not listed", function () {
    it("returns zero", async function () {
      const collateralRatio: BigNumber = await this.contracts.fintroller.getCollateralRatio(this.mocks.wbtc.address);
      expect(collateralRatio).to.equal(Zero);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("returns the default collateral ratio", async function () {
      const collateralRatio: BigNumber = await this.contracts.fintroller.getCollateralRatio(this.mocks.wbtc.address);
      expect(collateralRatio).to.equal(COLLATERAL_RATIOS.default);
    });
  });
}
