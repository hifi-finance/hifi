import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetCollateralCeiling(): void {
  context("when the collateral is not listed", function () {
    it("retrieves zero", async function () {
      const collateralCeiling: BigNumber = await this.contracts.fintroller.getCollateralCeiling(
        this.mocks.wbtc.address,
      );
      expect(collateralCeiling).to.equal(Zero);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves the default collateral ceiling", async function () {
      const collateralCeiling: BigNumber = await this.contracts.fintroller.getCollateralCeiling(
        this.mocks.hTokens[0].address,
      );
      expect(collateralCeiling).to.equal(Zero);
    });
  });
}
