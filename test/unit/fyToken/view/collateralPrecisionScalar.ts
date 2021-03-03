import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";

import { fyTokenConstants, precisionScalars } from "../../../../helpers/constants";
import { FyToken } from "../../../../typechain/FyToken";
import { deployFyToken } from "../../../deployers";

export default function shouldBehaveLikeCollateralPrecisionScalarGetter(): void {
  describe("when the collateral has 18 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(18));
    });

    it("retrieves 1", async function () {
      const fyToken: FyToken = await deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await fyToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith18Decimals);
    });
  });

  describe("when the collateral has 8 decimals", function () {
    beforeEach(async function () {
      await this.stubs.collateral.mock.decimals.returns(BigNumber.from(8));
    });

    it("retrieves 1.0e10", async function () {
      const fyToken: FyToken = await deployFyToken(
        this.signers.admin,
        fyTokenConstants.expirationTime,
        this.stubs.fintroller.address,
        this.stubs.balanceSheet.address,
        this.stubs.underlying.address,
        this.stubs.collateral.address,
      );
      const collateralPrecisionScalar: BigNumber = await fyToken.collateralPrecisionScalar();
      expect(collateralPrecisionScalar).to.equal(precisionScalars.tokenWith8Decimals);
    });
  });
}
