import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { DEFAULT_LIQUIDATION_INCENTIVE } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetDebtCeiling(): void {
  context("when the bond is not listed", function () {
    it("retrieves zero", async function () {
      const liquidationIncentive: BigNumber = await this.contracts.fintroller.getLiquidationIncentive(
        this.mocks.wbtc.address,
      );
      expect(liquidationIncentive).to.equal(Zero);
    });
  });

  context("when the collateral is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listCollateral(this.mocks.wbtc.address);
    });

    it("retrieves the default liquidation incentive", async function () {
      const liquidationIncentive: BigNumber = await this.contracts.fintroller.getLiquidationIncentive(
        this.mocks.wbtc.address,
      );
      expect(liquidationIncentive).to.equal(DEFAULT_LIQUIDATION_INCENTIVE);
    });
  });
}
