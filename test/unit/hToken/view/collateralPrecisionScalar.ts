import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { hTokenConstants, precisionScalars } from "../../../../helpers/constants";
import { HToken } from "../../../../typechain/HToken";
import { deployHToken } from "../../../deployers";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  context("when the collateral has 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(18));
    });

    it("retrieves 1", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await hToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith18Decimals);
    });
  });

  context("when the collateral has 8 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(8));
    });

    it("retrieves 1.0e10", async function () {
      const hToken: HToken = await deployHToken(
        this.signers.admin,
        hTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await hToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith8Decimals);
    });
  });
}
