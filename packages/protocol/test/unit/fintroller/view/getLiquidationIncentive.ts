import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { LIQUIDATION_INCENTIVES } from "@hifi/constants";
import { expect } from "chai";

export default function shouldBehaveLikeGetDebtCeiling(): void {
  context("when the bond is not listed", function () {
    it("returns zero", async function () {
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

    it("returns the default liquidation incentive", async function () {
      const liquidationIncentive: BigNumber = await this.contracts.fintroller.getLiquidationIncentive(
        this.mocks.wbtc.address,
      );
      expect(liquidationIncentive).to.equal(LIQUIDATION_INCENTIVES.default);
    });
  });
}
