import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { expect } from "chai";

import { fintrollerConstants } from "../../../../helpers/constants";

export default function shouldBehaveLikeGetBondDebtCeiling(): void {
  describe("when the bond is not listed", function () {
    it("retrieves zero", async function () {
      const bondLiquidationIncentive: BigNumber = await this.contracts.fintroller.getBondLiquidationIncentive(
        this.stubs.hToken.address,
      );
      expect(bondLiquidationIncentive).to.equal(Zero);
    });
  });

  describe("when the bond is listed", function () {
    beforeEach(async function () {
      await this.contracts.fintroller.connect(this.signers.admin).listBond(this.stubs.hToken.address);
    });

    it("retrieves the default liquidation incentive", async function () {
      const bondLiquidationIncentive: BigNumber = await this.contracts.fintroller.getBondLiquidationIncentive(
        this.stubs.hToken.address,
      );
      expect(bondLiquidationIncentive).to.equal(fintrollerConstants.defaultLiquidationIncentive);
    });
  });
}
